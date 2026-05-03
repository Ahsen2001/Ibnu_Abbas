<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Announcements\StoreAnnouncementRequest;
use App\Http\Requests\Announcements\UpdateAnnouncementRequest;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        return Announcement::with(['creator.role', 'department'])
            ->when($request->query('audience'), fn ($query, $audience) => $query->where('audience', $audience))
            ->when($request->query('department_id'), fn ($query, $id) => $query->where('department_id', $id))
            ->when($request->boolean('published_only'), fn ($query) => $query->where('is_published', true))
            ->latest('published_at')
            ->paginate((int) $request->query('per_page', 15));
    }

    public function store(StoreAnnouncementRequest $request)
    {
        $data = $request->validated();

        $announcement = Announcement::create([
            ...$data,
            'created_by' => $request->user()->id,
            'audience' => $data['audience'] ?? 'all',
            'is_published' => $data['is_published'] ?? true,
            'published_at' => ($data['is_published'] ?? true) ? ($data['published_at'] ?? now()) : null,
        ]);

        return response()->json($announcement->load(['creator.role', 'department']), 201);
    }

    public function show(Announcement $announcement)
    {
        return $announcement->load(['creator.role', 'department']);
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement)
    {
        $data = $request->validated();

        if (($data['is_published'] ?? false) && empty($data['published_at']) && ! $announcement->published_at) {
            $data['published_at'] = now();
        }

        $announcement->update($data);

        return $announcement->fresh()->load(['creator.role', 'department']);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->noContent();
    }
}
