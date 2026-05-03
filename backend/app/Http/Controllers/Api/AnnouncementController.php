<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Announcement::latest('published_at')->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'audience' => ['nullable', 'string', 'max:50'],
            'published_at' => ['nullable', 'date'],
        ]);

        return response()->json(Announcement::create([
            ...$data,
            'created_by' => $request->user()->id,
            'audience' => $data['audience'] ?? 'all',
            'published_at' => $data['published_at'] ?? now(),
        ]), 201);
    }
}
