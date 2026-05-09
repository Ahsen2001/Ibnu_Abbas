<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Announcements\StoreAnnouncementRequest;
use App\Http\Requests\Announcements\UpdateAnnouncementRequest;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function publicFeed(Request $request)
    {
        $announcements = Announcement::query()
            ->with('creator.role')
            ->where('status', 'published')
            ->where('target_audience', 'all')
            ->whereNull('department')
            ->where(function ($inner) {
                $inner->whereNull('published_at')->orWhere('published_at', '<=', now());
            })
            ->where(function ($inner) {
                $inner->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%"));
            })
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate((int) $request->query('per_page', 6))
            ->through(function (Announcement $announcement) {
                $announcement->setAttribute('is_expired', (bool) ($announcement->expires_at && $announcement->expires_at->isPast()));

                return $announcement;
            });

        return response()->json($announcements);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = in_array($user?->role?->slug, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF], true);

        $announcements = Announcement::query()
            ->with('creator.role')
            ->withExists([
                'readers as is_read' => fn ($query) => $query->where('users.id', $user?->id),
            ])
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('search'), function ($query, $search) {
                $query->where(fn ($inner) => $inner
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%"));
            })
            ->when($isAdmin, function ($query) use ($request) {
                $query
                    ->when($request->query('status'), fn ($inner, $status) => $inner->where('status', $status))
                    ->when($request->query('target_audience'), fn ($inner, $audience) => $inner->where('target_audience', $audience));
            }, function ($query) use ($user) {
                $query
                    ->where('status', 'published')
                    ->where(function ($inner) use ($user) {
                        $allowedAudiences = match ($user?->role?->slug) {
                            User::ROLE_STUDENT => ['all', 'students'],
                            User::ROLE_TEACHER => ['all', 'teachers'],
                            User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN_STAFF => ['all', 'admin'],
                            default => ['all'],
                        };

                        $inner->whereIn('target_audience', $allowedAudiences);
                    })
                    ->where(function ($inner) use ($user) {
                        $departments = $this->resolveDepartmentsForUser($user);

                        if (empty($departments)) {
                            $inner->whereNull('department');

                            return;
                        }

                        $inner->whereNull('department')->orWhereIn('department', $departments);
                    })
                    ->where(function ($inner) {
                        $inner->whereNull('published_at')->orWhere('published_at', '<=', now());
                    })
                    ->where(function ($inner) {
                        $inner->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                    });
            })
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate((int) $request->query('per_page', 15))
            ->through(function (Announcement $announcement) {
                $announcement->setAttribute('is_expired', (bool) ($announcement->expires_at && $announcement->expires_at->isPast()));

                return $announcement;
            });

        return response()->json($announcements);
    }

    public function store(StoreAnnouncementRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        $data['status'] = $data['status'] ?? 'draft';

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $announcement = Announcement::create($data);

        return response()->json($announcement->load('creator.role'), 201);
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement)
    {
        $data = $request->validated();

        if (($data['status'] ?? $announcement->status) === 'published' && empty($data['published_at']) && ! $announcement->published_at) {
            $data['published_at'] = now();
        }

        $announcement->update($data);

        return response()->json($announcement->fresh()->load('creator.role'));
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->noContent();
    }

    public function publish(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'published_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:published_at'],
        ]);

        $announcement->update([
            'status' => 'published',
            'published_at' => $data['published_at'] ?? $announcement->published_at ?? now(),
            'expires_at' => $data['expires_at'] ?? $announcement->expires_at,
        ]);

        return response()->json($announcement->fresh()->load('creator.role'));
    }

    public function archive(Announcement $announcement)
    {
        $announcement->update([
            'status' => 'archived',
        ]);

        return response()->json($announcement->fresh()->load('creator.role'));
    }

    public function markRead(Request $request, Announcement $announcement)
    {
        $announcement->readers()->syncWithoutDetaching([
            $request->user()->id => ['read_at' => now()],
        ]);

        return response()->json(['message' => 'Announcement marked as read.']);
    }

    private function resolveDepartmentsForUser(?User $user): array
    {
        if (! $user) {
            return [];
        }

        if ($user->role?->slug === User::ROLE_STUDENT) {
            return $user->student?->department ? [$user->student->department] : [];
        }

        if ($user->role?->slug === User::ROLE_TEACHER) {
            return match ($user->teacher?->department) {
                'both' => ['shareea', 'hifl'],
                'shareea', 'hifl' => [$user->teacher->department],
                default => [],
            };
        }

        return [];
    }
}
