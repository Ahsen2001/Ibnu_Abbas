<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesSanctumUser;
use App\Http\Controllers\Concerns\SignsMediaUrls;
use App\Http\Controllers\Controller;
use App\Models\IslamicLecture;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class IslamicLectureController extends Controller
{
    use ResolvesSanctumUser;
    use SignsMediaUrls;

    public function index(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]);

        $lectures = IslamicLecture::query()
            ->with(['speaker.role', 'creator.role'])
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->when($request->query('media_type'), fn ($query, $type) => $query->where('media_type', $type))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('speaker_name', 'like', "%{$search}%");
                });
            })
            ->when(! $privileged, fn ($query) => $query->where('is_published', true))
            ->latest('event_date')
            ->latest()
            ->paginate((int) $request->query('per_page', 12))
            ->through(fn (IslamicLecture $lecture) => $this->serializeLecture($lecture, false));

        return response()->json($lectures);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage Islamic lectures.');

        $data = $this->validateLecture($request, true);

        $lecture = IslamicLecture::create([
            ...collect($data)->except(['thumbnail', 'file'])->all(),
            'file_path' => $request->hasFile('file') ? $request->file('file')->store('islamic/lectures/media', 'public') : null,
            'thumbnail_path' => $this->resolveLectureThumbnail($request, $data),
            'is_published' => (bool) ($data['is_published'] ?? false),
            'created_by' => $user?->id,
        ]);

        return response()->json($this->serializeLecture($lecture->load(['speaker.role', 'creator.role']), true), 201);
    }

    public function show(Request $request, IslamicLecture $lecture): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]);
        abort_unless($lecture->is_published || $privileged, 404, 'Lecture not found.');

        DB::transaction(function () use ($lecture) {
            IslamicLecture::query()->whereKey($lecture->id)->increment('views_count');
        });

        $lecture->refresh()->load(['speaker.role', 'creator.role']);
        $related = IslamicLecture::query()
            ->where('is_published', true)
            ->where('category', $lecture->category)
            ->whereKeyNot($lecture->id)
            ->latest('event_date')
            ->limit(4)
            ->get()
            ->map(fn (IslamicLecture $item) => $this->serializeLecture($item, false))
            ->all();

        return response()->json([
            ...$this->serializeLecture($lecture, true),
            'related_lectures' => $related,
        ]);
    }

    public function update(Request $request, IslamicLecture $lecture): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage Islamic lectures.');

        $data = $this->validateLecture($request, false);

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($lecture->file_path);
            $data['file_path'] = $request->file('file')->store('islamic/lectures/media', 'public');
        }

        if ($request->hasFile('thumbnail')) {
            if ($lecture->thumbnail_path && ! Str::startsWith($lecture->thumbnail_path, ['http://', 'https://'])) {
                Storage::disk('public')->delete($lecture->thumbnail_path);
            }

            $data['thumbnail_path'] = $request->file('thumbnail')->store('islamic/lectures/thumbs', 'public');
        } elseif (($data['media_type'] ?? $lecture->media_type) === 'youtube' && ! empty($data['youtube_url'])) {
            $data['thumbnail_path'] = $this->youtubeThumbnailUrl($data['youtube_url']);
        }

        unset($data['thumbnail'], $data['file']);

        if (($data['media_type'] ?? $lecture->media_type) === 'youtube' && array_key_exists('file_path', $data) === false && $request->has('youtube_url')) {
            Storage::disk('public')->delete($lecture->file_path);
            $data['file_path'] = null;
        }

        $lecture->update($data);

        return response()->json($this->serializeLecture($lecture->fresh()->load(['speaker.role', 'creator.role']), true));
    }

    public function destroy(Request $request, IslamicLecture $lecture): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage Islamic lectures.');

        Storage::disk('public')->delete($lecture->file_path);
        if ($lecture->thumbnail_path && ! Str::startsWith($lecture->thumbnail_path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($lecture->thumbnail_path);
        }
        $lecture->delete();

        return response()->json(['message' => 'Islamic lecture deleted successfully.']);
    }

    public function featured(): JsonResponse
    {
        $lectures = IslamicLecture::query()
            ->where('is_published', true)
            ->latest('event_date')
            ->limit(6)
            ->get()
            ->map(fn (IslamicLecture $lecture) => $this->serializeLecture($lecture, false));

        return response()->json($lectures);
    }

    private function validateLecture(Request $request, bool $isCreate): array
    {
        $requiredOrSometimes = $isCreate ? 'required' : 'sometimes';

        return $request->validate([
            'title' => [$requiredOrSometimes, 'array'],
            'title.en' => [$isCreate ? 'required' : 'required_with:title', 'string', 'max:255'],
            'title.ta' => ['nullable', 'string', 'max:255'],
            'title.si' => ['nullable', 'string', 'max:255'],
            'title.ar' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string'],
            'description.ta' => ['nullable', 'string'],
            'description.si' => ['nullable', 'string'],
            'description.ar' => ['nullable', 'string'],
            'speaker_name' => [$requiredOrSometimes, 'string', 'max:255'],
            'speaker_id' => ['nullable', 'exists:users,id'],
            'category' => [$requiredOrSometimes, Rule::in(['friday_sermon', 'lecture', 'seminar', 'workshop', 'debate'])],
            'media_type' => [$requiredOrSometimes, Rule::in(['video', 'audio', 'youtube'])],
            'file' => ['nullable', 'file', 'mimes:mp4,mov,avi,m4a,mp3,wav,ogg,webm', 'max:102400'],
            'youtube_url' => ['nullable', 'url'],
            'thumbnail' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'event_date' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'is_published' => ['nullable', 'boolean'],
        ]);
    }

    private function resolveLectureThumbnail(Request $request, array $data): ?string
    {
        if ($request->hasFile('thumbnail')) {
            return $request->file('thumbnail')->store('islamic/lectures/thumbs', 'public');
        }

        if (($data['media_type'] ?? null) === 'youtube' && ! empty($data['youtube_url'])) {
            return $this->youtubeThumbnailUrl($data['youtube_url']);
        }

        return null;
    }

    private function youtubeThumbnailUrl(string $url): ?string
    {
        $videoId = null;

        if (preg_match('~(?:youtu\.be/|youtube\.com/watch\?v=|youtube\.com/embed/)([\w-]{11})~', $url, $matches)) {
            $videoId = $matches[1];
        }

        return $videoId ? "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg" : null;
    }

    private function serializeLecture(IslamicLecture $lecture, bool $includeDescription): array
    {
        $thumbnail = $this->signedMediaLinks($lecture->thumbnail_path, basename($lecture->thumbnail_path ?? 'thumbnail.webp'));
        $media = $this->signedMediaLinks($lecture->file_path, basename($lecture->file_path ?? 'lecture-media'));
        $description = $includeDescription ? $lecture->description : collect($lecture->description ?? [])->map(fn ($value) => is_string($value) ? Str::limit(strip_tags($value), 220) : $value)->all();

        return [
            ...$lecture->toArray(),
            'description' => $description,
            'thumbnail_url' => $thumbnail['preview_url'],
            'media_url' => $lecture->media_type === 'youtube' ? $lecture->youtube_url : $media['preview_url'],
            'media_download_url' => $lecture->media_type === 'youtube' ? $lecture->youtube_url : $media['download_url'],
        ];
    }
}
