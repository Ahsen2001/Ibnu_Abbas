<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesSanctumUser;
use App\Http\Controllers\Concerns\SignsMediaUrls;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class VideoController extends Controller
{
    use ResolvesSanctumUser;
    use SignsMediaUrls;

    public function index(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]);

        $videos = Video::query()
            ->with('creator.role')
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(! $privileged, fn ($query) => $query->where('is_published', true))
            ->when($request->query('sort') === 'most_viewed', fn ($query) => $query->orderByDesc('views_count'), fn ($query) => $query->latest('event_date')->latest())
            ->paginate((int) $request->query('per_page', 12))
            ->through(fn (Video $video) => $this->serializeVideo($video));

        return response()->json($videos);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        $data = $this->validateVideo($request, true);

        $video = Video::create([
            ...collect($data)->except(['thumbnail', 'file'])->all(),
            'file_path' => $request->hasFile('file') ? $request->file('file')->store('videos/files', 'public') : null,
            'thumbnail_path' => $this->resolveVideoThumbnail($request, $data),
            'is_published' => (bool) ($data['is_published'] ?? false),
            'created_by' => $user?->id,
        ]);

        return response()->json($this->serializeVideo($video->load('creator.role')), 201);
    }

    public function show(Request $request, Video $video): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]);
        abort_unless($video->is_published || $privileged, 404, 'Video not found.');

        DB::transaction(function () use ($video) {
            Video::query()->whereKey($video->id)->increment('views_count');
        });

        $video->refresh()->load('creator.role');
        $related = Video::query()
            ->where('is_published', true)
            ->where('category', $video->category)
            ->whereKeyNot($video->id)
            ->latest('event_date')
            ->limit(4)
            ->get()
            ->map(fn (Video $item) => $this->serializeVideo($item))
            ->all();

        return response()->json([
            ...$this->serializeVideo($video),
            'related_videos' => $related,
        ]);
    }

    public function update(Request $request, Video $video): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        $data = $this->validateVideo($request, false);

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($video->file_path);
            $data['file_path'] = $request->file('file')->store('videos/files', 'public');
        }

        if ($request->hasFile('thumbnail')) {
            if ($video->thumbnail_path && ! Str::startsWith($video->thumbnail_path, ['http://', 'https://'])) {
                Storage::disk('public')->delete($video->thumbnail_path);
            }

            $data['thumbnail_path'] = $request->file('thumbnail')->store('videos/thumbs', 'public');
        } elseif (($data['media_type'] ?? $video->media_type) === 'youtube' && ! empty($data['youtube_url'])) {
            $data['thumbnail_path'] = $this->youtubeThumbnailUrl($data['youtube_url']);
            Storage::disk('public')->delete($video->file_path);
            $data['file_path'] = null;
        }

        unset($data['thumbnail'], $data['file']);
        $video->update($data);

        return response()->json($this->serializeVideo($video->fresh()->load('creator.role')));
    }

    public function destroy(Request $request, Video $video): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        Storage::disk('public')->delete($video->file_path);
        if ($video->thumbnail_path && ! Str::startsWith($video->thumbnail_path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($video->thumbnail_path);
        }
        $video->delete();

        return response()->json(['message' => 'Video deleted successfully.']);
    }

    public function featured(): JsonResponse
    {
        $videos = Video::query()
            ->where('is_published', true)
            ->latest('event_date')
            ->limit(6)
            ->get()
            ->map(fn (Video $video) => $this->serializeVideo($video));

        return response()->json($videos);
    }

    private function validateVideo(Request $request, bool $isCreate): array
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
            'media_type' => [$requiredOrSometimes, Rule::in(['youtube', 'uploaded'])],
            'youtube_url' => ['nullable', 'url'],
            'file' => ['nullable', 'file', 'mimes:mp4,mov,avi,webm', 'max:153600'],
            'thumbnail' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'category' => [$requiredOrSometimes, Rule::in(['event', 'lecture', 'graduation', 'general'])],
            'event_date' => ['nullable', 'date'],
            'is_published' => ['nullable', 'boolean'],
        ]);
    }

    private function resolveVideoThumbnail(Request $request, array $data): ?string
    {
        if ($request->hasFile('thumbnail')) {
            return $request->file('thumbnail')->store('videos/thumbs', 'public');
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

    private function serializeVideo(Video $video): array
    {
        $thumbnail = $this->signedMediaLinks($video->thumbnail_path, basename($video->thumbnail_path ?? 'thumbnail.webp'));
        $file = $this->signedMediaLinks($video->file_path, basename($video->file_path ?? 'video'));

        return [
            ...$video->toArray(),
            'thumbnail_url' => $thumbnail['preview_url'],
            'media_url' => $video->media_type === 'youtube' ? $video->youtube_url : $file['preview_url'],
            'media_download_url' => $video->media_type === 'youtube' ? $video->youtube_url : $file['download_url'],
        ];
    }

    private function authorizeAdmin(?User $user): void
    {
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage videos.');
    }
}
