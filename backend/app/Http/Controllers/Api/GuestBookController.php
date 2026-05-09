<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesSanctumUser;
use App\Http\Controllers\Concerns\SignsMediaUrls;
use App\Http\Controllers\Controller;
use App\Models\GuestEntry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuestBookController extends Controller
{
    use ResolvesSanctumUser;
    use SignsMediaUrls;

    public function index(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage guest entries.');

        $entries = GuestEntry::query()
            ->latest('visit_date')
            ->paginate((int) $request->query('per_page', 12))
            ->through(fn (GuestEntry $entry) => $this->serializeEntry($entry));

        return response()->json($entries);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage guest entries.');

        $data = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string'],
            'visit_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $entry = GuestEntry::create([
            ...collect($data)->except(['photo'])->all(),
            'photo_path' => $request->hasFile('photo') ? $request->file('photo')->store('guestbook/photos', 'public') : null,
            'created_by' => $user?->id,
            'is_published' => (bool) ($data['is_published'] ?? false),
        ]);

        return response()->json($this->serializeEntry($entry), 201);
    }

    public function update(Request $request, GuestEntry $guestEntry): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage guest entries.');

        $data = $request->validate([
            'guest_name' => ['sometimes', 'required', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:120'],
            'message' => ['sometimes', 'required', 'string'],
            'visit_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('photo')) {
            Storage::disk('public')->delete($guestEntry->photo_path);
            $data['photo_path'] = $request->file('photo')->store('guestbook/photos', 'public');
        }

        unset($data['photo']);
        $guestEntry->update($data);

        return response()->json($this->serializeEntry($guestEntry->fresh()));
    }

    public function destroy(Request $request, GuestEntry $guestEntry): JsonResponse
    {
        $user = $this->currentApiUser($request);
        abort_unless($this->userHasAnyRole($user, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF]), 403, 'Only administrators can manage guest entries.');

        Storage::disk('public')->delete($guestEntry->photo_path);
        $guestEntry->delete();

        return response()->json(['message' => 'Guest book entry deleted successfully.']);
    }

    public function public(Request $request): JsonResponse
    {
        $entries = GuestEntry::query()
            ->where('is_published', true)
            ->latest('visit_date')
            ->paginate((int) $request->query('per_page', 12))
            ->through(fn (GuestEntry $entry) => $this->serializeEntry($entry));

        return response()->json($entries);
    }

    private function serializeEntry(GuestEntry $entry): array
    {
        $photo = $this->signedMediaLinks($entry->photo_path, basename($entry->photo_path ?? 'guest-photo.webp'));

        return [
            ...$entry->toArray(),
            'photo_url' => $photo['preview_url'],
        ];
    }
}
