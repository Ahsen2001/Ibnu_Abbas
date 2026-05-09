<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesSanctumUser;
use App\Http\Controllers\Concerns\SignsMediaUrls;
use App\Http\Controllers\Controller;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class GalleryController extends Controller
{
    use ResolvesSanctumUser;
    use SignsMediaUrls;

    public function index(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $canManage = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]);

        $albums = GalleryAlbum::query()
            ->withCount('images')
            ->with(['images' => fn ($query) => $query->orderBy('sort_order')])
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(! $canManage, fn ($query) => $query->where('is_published', true))
            ->orderBy('sort_order')
            ->orderByDesc('event_date')
            ->paginate((int) $request->query('per_page', 12))
            ->through(fn (GalleryAlbum $album) => $this->serializeAlbum($album, false));

        return response()->json($albums);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

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
            'event_date' => ['nullable', 'date'],
            'category' => ['required', Rule::in(['event', 'graduation', 'academic', 'construction', 'general'])],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $album = GalleryAlbum::create([
            ...$data,
            'created_by' => $user?->id,
            'is_published' => (bool) ($data['is_published'] ?? false),
            'sort_order' => $data['sort_order'] ?? ((int) GalleryAlbum::query()->max('sort_order') + 1),
        ]);

        return response()->json($this->serializeAlbum($album->load('images'), true), 201);
    }

    public function show(Request $request, GalleryAlbum $album): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $canManage = $this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]);

        abort_unless($album->is_published || $canManage, 404, 'Album not found.');

        return response()->json($this->serializeAlbum(
            $album->load(['images' => fn ($query) => $query->orderBy('sort_order')]),
            true
        ));
    }

    public function update(Request $request, GalleryAlbum $album): JsonResponse
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
            'event_date' => ['nullable', 'date'],
            'category' => ['sometimes', 'required', Rule::in(['event', 'graduation', 'academic', 'construction', 'general'])],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $album->update($data);

        return response()->json($this->serializeAlbum($album->fresh()->load('images'), true));
    }

    public function destroy(Request $request, GalleryAlbum $album): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        foreach ($album->images as $image) {
            $this->deleteGalleryImageFiles($image);
        }

        $album->delete();

        return response()->json(['message' => 'Gallery album deleted successfully.']);
    }

    public function uploadImages(Request $request, GalleryAlbum $album): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        $data = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:50'],
            'images.*' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'array'],
        ]);

        $created = collect();
        $nextSortOrder = (int) $album->images()->max('sort_order');

        foreach ($request->file('images', []) as $index => $file) {
            $paths = $this->storeGalleryImageVariants($file);
            $caption = $data['captions'][$index] ?? ['en' => '', 'ta' => '', 'si' => '', 'ar' => ''];
            $nextSortOrder++;

            $image = $album->images()->create([
                'image_path' => $paths['medium'],
                'thumbnail_path' => $paths['thumbnail'],
                'caption' => $caption,
                'sort_order' => $nextSortOrder,
                'is_cover' => false,
            ]);

            $created->push($image);
        }

        if (! $album->cover_image_path && $created->isNotEmpty()) {
            $firstImage = $created->first();
            $firstImage->update(['is_cover' => true]);
            $album->update(['cover_image_path' => $firstImage->image_path]);
        }

        return response()->json([
            'message' => 'Images uploaded successfully.',
            'album' => $this->serializeAlbum($album->fresh()->load(['images' => fn ($query) => $query->orderBy('sort_order')]), true),
        ]);
    }

    public function deleteImage(Request $request, GalleryImage $image): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        $album = $image->album;
        $wasCover = $image->is_cover;
        $this->deleteGalleryImageFiles($image);
        $image->delete();

        if ($wasCover) {
            $replacement = $album->images()->orderBy('sort_order')->first();
            $album->update([
                'cover_image_path' => $replacement?->image_path,
            ]);

            if ($replacement) {
                $album->images()->update(['is_cover' => false]);
                $replacement->update(['is_cover' => true]);
            }
        }

        return response()->json(['message' => 'Image deleted successfully.']);
    }

    public function setCover(Request $request, GalleryImage $image): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        $album = $image->album;

        DB::transaction(function () use ($album, $image) {
            $album->images()->update(['is_cover' => false]);
            $image->update(['is_cover' => true]);
            $album->update(['cover_image_path' => $image->image_path]);
        });

        return response()->json([
            'message' => 'Album cover updated successfully.',
            'album' => $this->serializeAlbum($album->fresh()->load(['images' => fn ($query) => $query->orderBy('sort_order')]), true),
        ]);
    }

    public function reorder(Request $request, GalleryAlbum $album): JsonResponse
    {
        $user = $this->currentApiUser($request);
        $this->authorizeAdmin($user);

        $data = $request->validate([
            'image_ids' => ['required', 'array', 'min:1'],
            'image_ids.*' => ['integer', Rule::exists('gallery_images', 'id')->where('album_id', $album->id)],
        ]);

        foreach ($data['image_ids'] as $index => $imageId) {
            GalleryImage::query()
                ->where('album_id', $album->id)
                ->whereKey($imageId)
                ->update(['sort_order' => $index + 1]);
        }

        return response()->json([
            'message' => 'Album image order updated successfully.',
            'album' => $this->serializeAlbum($album->fresh()->load(['images' => fn ($query) => $query->orderBy('sort_order')]), true),
        ]);
    }

    private function authorizeAdmin(?User $user): void
    {
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage the gallery.');
    }

    private function serializeAlbum(GalleryAlbum $album, bool $includeImages): array
    {
        $cover = $this->signedMediaLinks($album->cover_image_path, Str::slug($album->title['en'] ?? 'album-cover') . '.webp');
        $images = $includeImages
            ? $album->images->sortBy('sort_order')->values()->map(fn (GalleryImage $image) => $this->serializeImage($image))->all()
            : [];

        return [
            ...$album->toArray(),
            'images_count' => $album->images_count ?? $album->images->count(),
            'cover_image_url' => $cover['preview_url'],
            'cover_download_url' => $cover['download_url'],
            'images' => $images,
        ];
    }

    private function serializeImage(GalleryImage $image): array
    {
        $medium = $this->signedMediaLinks($image->image_path, basename($image->image_path));
        $thumbnail = $this->signedMediaLinks($image->thumbnail_path, basename($image->thumbnail_path));

        return [
            ...$image->toArray(),
            'image_url' => $medium['preview_url'],
            'thumbnail_url' => $thumbnail['preview_url'],
            'download_url' => $medium['download_url'],
        ];
    }

    private function storeGalleryImageVariants(\Illuminate\Http\UploadedFile $file): array
    {
        $manager = new ImageManager(new Driver());
        $baseName = Str::uuid()->toString() . '.webp';
        $originalPath = storage_path('app/public/gallery/originals/' . $baseName);
        $mediumPath = storage_path('app/public/gallery/' . $baseName);
        $thumbnailPath = storage_path('app/public/gallery/thumbs/' . $baseName);

        Storage::disk('public')->makeDirectory('gallery/originals');
        Storage::disk('public')->makeDirectory('gallery');
        Storage::disk('public')->makeDirectory('gallery/thumbs');

        $original = $manager->read($file->getRealPath());
        $original->save($originalPath, quality: 85);

        $medium = $manager->read($file->getRealPath());
        $medium->scaleDown(width: 800, height: 600)->save($mediumPath, quality: 82);

        $thumbnail = $manager->read($file->getRealPath());
        $thumbnail->cover(300, 300)->save($thumbnailPath, quality: 80);

        return [
            'original' => 'gallery/originals/' . $baseName,
            'medium' => 'gallery/' . $baseName,
            'thumbnail' => 'gallery/thumbs/' . $baseName,
        ];
    }

    private function deleteGalleryImageFiles(GalleryImage $image): void
    {
        $paths = array_filter([
            $image->image_path,
            $image->thumbnail_path,
            $this->originalPathFromImage($image->image_path),
        ]);

        Storage::disk('public')->delete($paths);
    }

    private function originalPathFromImage(?string $imagePath): ?string
    {
        if (! $imagePath) {
            return null;
        }

        return 'gallery/originals/' . basename($imagePath);
    }
}
