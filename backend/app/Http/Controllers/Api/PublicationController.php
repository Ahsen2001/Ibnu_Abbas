<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesSanctumUser;
use App\Http\Controllers\Concerns\SignsMediaUrls;
use App\Http\Controllers\Controller;
use App\Models\Publication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PublicationController extends Controller
{
    use ResolvesSanctumUser;
    use SignsMediaUrls;

    public function index(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]);

        $publications = Publication::query()
            ->with('creator.role')
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->when($request->query('year'), fn ($query, $year) => $query->where('published_year', $year))
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('author_editor', 'like', "%{$search}%");
                });
            })
            ->when(! $privileged, fn ($query) => $query->where('is_published', true))
            ->when($request->query('sort') === 'most_downloaded', fn ($query) => $query->orderByDesc('download_count'), fn ($query) => $query->orderByDesc('published_date')->orderByDesc('published_year'))
            ->paginate((int) $request->query('per_page', 12))
            ->through(fn (Publication $publication) => $this->serializePublication($publication));

        return response()->json($publications);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]), 403, 'You are not allowed to upload publications.');

        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:255'],
            'title.ta' => ['nullable', 'string', 'max:255'],
            'title.si' => ['nullable', 'string', 'max:255'],
            'title.ar' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string'],
            'description.ta' => ['nullable', 'string'],
            'description.si' => ['nullable', 'string'],
            'description.ar' => ['nullable', 'string'],
            'category' => ['required', Rule::in(['thikra_magazine', 'syllabus_book', 'souvenir', 'general_knowledge', 'research_journal', 'newsletter'])],
            'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'file' => ['required', 'file', 'mimes:pdf', 'max:25600'],
            'issue_number' => ['nullable', 'string', 'max:50'],
            'published_year' => ['required', 'integer', 'min:2000', 'max:' . (now()->year + 1)],
            'published_date' => ['nullable', 'date'],
            'author_editor' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $publication = Publication::create([
            ...collect($data)->except(['cover_image', 'file'])->all(),
            'cover_image_path' => $request->hasFile('cover_image') ? $request->file('cover_image')->store('publications/covers', 'public') : null,
            'file_path' => $request->file('file')->store('publications/files', 'public'),
            'is_published' => $this->userHasAnyRole($user, [User::ROLE_TEACHER]) ? false : (bool) ($data['is_published'] ?? false),
            'created_by' => $user?->id,
        ]);

        return response()->json($this->serializePublication($publication->load('creator.role')), 201);
    }

    public function show(Request $request, Publication $publication): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]);

        abort_unless($publication->is_published || $privileged, 404, 'Publication not found.');

        $related = Publication::query()
            ->whereKeyNot($publication->id)
            ->where('category', $publication->category)
            ->where('is_published', true)
            ->latest('published_date')
            ->limit(4)
            ->get()
            ->map(fn (Publication $item) => $this->serializePublication($item))
            ->all();

        return response()->json([
            ...$this->serializePublication($publication->load('creator.role')),
            'related_publications' => $related,
        ]);
    }

    public function update(Request $request, Publication $publication): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'array'],
            'title.en' => ['required_with:title', 'string', 'max:255'],
            'title.ta' => ['nullable', 'string', 'max:255'],
            'title.si' => ['nullable', 'string', 'max:255'],
            'title.ar' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string'],
            'description.ta' => ['nullable', 'string'],
            'description.si' => ['nullable', 'string'],
            'description.ar' => ['nullable', 'string'],
            'category' => ['sometimes', 'required', Rule::in(['thikra_magazine', 'syllabus_book', 'souvenir', 'general_knowledge', 'research_journal', 'newsletter'])],
            'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'file' => ['nullable', 'file', 'mimes:pdf', 'max:25600'],
            'issue_number' => ['nullable', 'string', 'max:50'],
            'published_year' => ['sometimes', 'required', 'integer', 'min:2000', 'max:' . (now()->year + 1)],
            'published_date' => ['nullable', 'date'],
            'author_editor' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
            'is_published' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('cover_image')) {
            Storage::disk('public')->delete($publication->cover_image_path);
            $data['cover_image_path'] = $request->file('cover_image')->store('publications/covers', 'public');
        }

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($publication->file_path);
            $data['file_path'] = $request->file('file')->store('publications/files', 'public');
        }

        unset($data['cover_image'], $data['file']);
        $publication->update($data);

        return response()->json($this->serializePublication($publication->fresh()->load('creator.role')));
    }

    public function destroy(Request $request, Publication $publication): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        Storage::disk('public')->delete([$publication->cover_image_path, $publication->file_path]);
        $publication->delete();

        return response()->json(['message' => 'Publication deleted successfully.']);
    }

    public function download(Request $request, Publication $publication): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]);
        abort_unless($publication->is_published || $privileged, 404, 'Publication not found.');

        DB::transaction(function () use ($publication) {
            Publication::query()->whereKey($publication->id)->increment('download_count');
        });

        $publication->refresh();

        return response()->json([
            'message' => 'Publication download prepared successfully.',
            'download_count' => $publication->download_count,
            ...$this->signedMediaLinks($publication->file_path, Str::slug($publication->title['en'] ?? 'publication') . '.pdf'),
        ]);
    }

    public function featured(): JsonResponse
    {
        $categories = ['thikra_magazine', 'syllabus_book', 'souvenir', 'general_knowledge', 'research_journal', 'newsletter'];

        $featured = collect($categories)->mapWithKeys(function (string $category) {
            $item = Publication::query()
                ->where('category', $category)
                ->where('is_published', true)
                ->latest('published_date')
                ->latest()
                ->first();

            return [$category => $item ? $this->serializePublication($item) : null];
        });

        return response()->json($featured);
    }

    private function authorizeAdmin(?User $user): void
    {
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage publications.');
    }

    private function serializePublication(Publication $publication): array
    {
        $cover = $this->signedMediaLinks($publication->cover_image_path, basename($publication->cover_image_path ?? 'cover.webp'));
        $file = $this->signedMediaLinks($publication->file_path, Str::slug($publication->title['en'] ?? 'publication') . '.pdf');

        return [
            ...$publication->toArray(),
            'cover_image_url' => $cover['preview_url'],
            'preview_url' => $file['preview_url'],
            'download_url' => $file['download_url'],
        ];
    }
}
