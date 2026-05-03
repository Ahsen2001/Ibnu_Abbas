<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shareea\StoreShareeaRecordRequest;
use App\Http\Requests\Shareea\UpdateShareeaRecordRequest;
use App\Models\ShareeaRecord;
use Illuminate\Http\Request;

class ShareeaController extends Controller
{
    public function index(Request $request)
    {
        return ShareeaRecord::with(['student.department', 'teacher'])
            ->when($request->query('student_id'), fn ($query, $id) => $query->where('student_id', $id))
            ->when($request->query('teacher_id'), fn ($query, $id) => $query->where('teacher_id', $id))
            ->when($request->query('academic_level'), fn ($query, $level) => $query->where('academic_level', $level))
            ->when($request->query('result_status'), fn ($query, $status) => $query->where('result_status', $status))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));
    }

    public function store(StoreShareeaRecordRequest $request)
    {
        $record = ShareeaRecord::create($request->validated());

        return response()->json($record->load(['student.department', 'teacher']), 201);
    }

    public function show(ShareeaRecord $shareea)
    {
        return $shareea->load(['student.department', 'teacher']);
    }

    public function update(UpdateShareeaRecordRequest $request, ShareeaRecord $shareea)
    {
        $shareea->update($request->validated());

        return $shareea->fresh()->load(['student.department', 'teacher']);
    }

    public function destroy(ShareeaRecord $shareea)
    {
        $shareea->delete();

        return response()->noContent();
    }
}
