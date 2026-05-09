<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesSanctumUser;
use App\Http\Controllers\Concerns\SignsMediaUrls;
use App\Http\Controllers\Controller;
use App\Models\IslamicArticle;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class IslamicArticleController extends Controller
{
    use ResolvesSanctumUser;
    use SignsMediaUrls;

    public function index(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]);

        $articles = IslamicArticle::query()
            ->with(['author.role', 'creator.role'])
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhere('author_name', 'like', "%{$search}%");
                });
            })
            ->when(! $privileged, fn ($query) => $query->where('is_published', true))
            ->when($request->query('sort') === 'most_viewed', fn ($query) => $query->orderByDesc('views_count'), fn ($query) => $query->orderByDesc('published_at')->orderByDesc('created_at'))
            ->paginate((int) $request->query('per_page', 12))
            ->through(fn (IslamicArticle $article) => $this->serializeArticle($article, false));

        return response()->json($articles);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage Islamic articles.');

        $data = $request->validate([
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:255'],
            'title.ta' => ['nullable', 'string', 'max:255'],
            'title.si' => ['nullable', 'string', 'max:255'],
            'title.ar' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'array'],
            'content.en' => ['nullable', 'string'],
            'content.ta' => ['nullable', 'string'],
            'content.si' => ['nullable', 'string'],
            'content.ar' => ['nullable', 'string'],
            'author_name' => ['required', 'string', 'max:255'],
            'author_id' => ['nullable', 'exists:users,id'],
            'category' => ['required', Rule::in(['fiqh', 'aqeedah', 'seerah', 'quran_tafsir', 'hadith', 'general', 'fatwa'])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $article = IslamicArticle::create([
            ...collect($data)->except(['cover_image'])->all(),
            'cover_image_path' => $request->hasFile('cover_image') ? $request->file('cover_image')->store('islamic/articles/covers', 'public') : null,
            'is_published' => (bool) ($data['is_published'] ?? false),
            'published_at' => ($data['is_published'] ?? false) ? ($data['published_at'] ?? now()) : null,
            'created_by' => $user?->id,
        ]);

        return response()->json($this->serializeArticle($article->load(['author.role', 'creator.role']), true), 201);
    }

    public function show(Request $request, IslamicArticle $article): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $privileged = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF, User::ROLE_TEACHER]);
        abort_unless($article->is_published || $privileged, 404, 'Article not found.');

        DB::transaction(function () use ($article) {
            IslamicArticle::query()->whereKey($article->id)->increment('views_count');
        });

        $article->refresh()->load(['author.role', 'creator.role']);
        $related = IslamicArticle::query()
            ->where('is_published', true)
            ->where('category', $article->category)
            ->whereKeyNot($article->id)
            ->latest('published_at')
            ->limit(4)
            ->get()
            ->map(fn (IslamicArticle $item) => $this->serializeArticle($item, false))
            ->all();

        return response()->json([
            ...$this->serializeArticle($article, true),
            'related_articles' => $related,
        ]);
    }

    public function update(Request $request, IslamicArticle $article): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage Islamic articles.');

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'array'],
            'title.en' => ['required_with:title', 'string', 'max:255'],
            'title.ta' => ['nullable', 'string', 'max:255'],
            'title.si' => ['nullable', 'string', 'max:255'],
            'title.ar' => ['nullable', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'array'],
            'content.en' => ['nullable', 'string'],
            'content.ta' => ['nullable', 'string'],
            'content.si' => ['nullable', 'string'],
            'content.ar' => ['nullable', 'string'],
            'author_name' => ['sometimes', 'required', 'string', 'max:255'],
            'author_id' => ['nullable', 'exists:users,id'],
            'category' => ['sometimes', 'required', Rule::in(['fiqh', 'aqeedah', 'seerah', 'quran_tafsir', 'hadith', 'general', 'fatwa'])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        if ($request->hasFile('cover_image')) {
            Storage::disk('public')->delete($article->cover_image_path);
            $data['cover_image_path'] = $request->file('cover_image')->store('islamic/articles/covers', 'public');
        }

        if (array_key_exists('is_published', $data) && $data['is_published'] && ! $article->published_at) {
            $data['published_at'] = $data['published_at'] ?? now();
        }

        unset($data['cover_image']);
        $article->update($data);

        return response()->json($this->serializeArticle($article->fresh()->load(['author.role', 'creator.role']), true));
    }

    public function destroy(Request $request, IslamicArticle $article): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage Islamic articles.');

        Storage::disk('public')->delete($article->cover_image_path);
        $article->delete();

        return response()->json(['message' => 'Islamic article deleted successfully.']);
    }

    public function featured(): JsonResponse
    {
        $articles = IslamicArticle::query()
            ->where('is_published', true)
            ->latest('published_at')
            ->limit(6)
            ->get()
            ->map(fn (IslamicArticle $article) => $this->serializeArticle($article, false));

        return response()->json($articles);
    }

    public function byCategory(string $cat): JsonResponse
    {
        abort_unless(in_array($cat, ['fiqh', 'aqeedah', 'seerah', 'quran_tafsir', 'hadith', 'general', 'fatwa'], true), 404);

        $articles = IslamicArticle::query()
            ->where('is_published', true)
            ->where('category', $cat)
            ->latest('published_at')
            ->paginate(12)
            ->through(fn (IslamicArticle $article) => $this->serializeArticle($article, false));

        return response()->json($articles);
    }

    private function serializeArticle(IslamicArticle $article, bool $includeBody): array
    {
        $cover = $this->signedMediaLinks($article->cover_image_path, basename($article->cover_image_path ?? 'cover.webp'));
        $content = $includeBody ? $article->content : collect($article->content ?? [])->map(fn ($value) => is_string($value) ? Str::limit(strip_tags($value), 220) : $value)->all();

        return [
            ...$article->toArray(),
            'content' => $content,
            'cover_image_url' => $cover['preview_url'],
        ];
    }
}
