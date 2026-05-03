<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hifl\StoreHiflProgressRequest;
use App\Http\Requests\Hifl\UpdateHiflProgressRequest;
use App\Models\HiflProgress;
use Illuminate\Http\Request;

class HiflController extends Controller
{
    public function index(Request $request)
    {
        return HiflProgress::with(['student.department', 'teacher'])
            ->when($request->query('student_id'), fn ($query, $id) => $query->where('student_id', $id))
            ->when($request->query('teacher_id'), fn ($query, $id) => $query->where('teacher_id', $id))
            ->when($request->query('recorded_on'), fn ($query, $date) => $query->whereDate('recorded_on', $date))
            ->when($request->query('quality_rating'), fn ($query, $rating) => $query->where('quality_rating', $rating))
            ->latest('recorded_on')
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(StoreHiflProgressRequest $request)
    {
        $progress = HiflProgress::create($request->validated());

        return response()->json($progress->load(['student.department', 'teacher']), 201);
    }

    public function show(HiflProgress $hifl)
    {
        return $hifl->load(['student.department', 'teacher']);
    }

    public function update(UpdateHiflProgressRequest $request, HiflProgress $hifl)
    {
        $hifl->update($request->validated());

        return $hifl->fresh()->load(['student.department', 'teacher']);
    }

    public function destroy(HiflProgress $hifl)
    {
        $hifl->delete();

        return response()->noContent();
    }
}
