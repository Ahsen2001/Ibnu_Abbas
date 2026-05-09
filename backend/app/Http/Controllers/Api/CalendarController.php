<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\StoreAcademicCalendarRequest;
use App\Http\Requests\Calendar\UpdateAcademicCalendarRequest;
use App\Models\AcademicCalendar;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $events = AcademicCalendar::with('creator.role')
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->when($request->query('event_type'), fn ($query, $eventType) => $query->where('event_type', $eventType))
            ->when($request->query('month'), function ($query, $month) {
                $monthStart = Carbon::parse("{$month}-01")->startOfMonth();
                $monthEnd = $monthStart->copy()->endOfMonth();

                $query->whereDate('event_date', '<=', $monthEnd)
                    ->where(function ($inner) use ($monthStart) {
                        $inner->whereNull('end_date')->orWhereDate('end_date', '>=', $monthStart);
                    });
            })
            ->when($request->query('date_from'), fn ($query, $dateFrom) => $query->whereDate('event_date', '>=', $dateFrom))
            ->when($request->query('date_to'), fn ($query, $dateTo) => $query->whereDate('event_date', '<=', $dateTo))
            ->orderBy('event_date')
            ->get();

        return response()->json($events);
    }

    public function store(StoreAcademicCalendarRequest $request)
    {
        $event = AcademicCalendar::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($event->load('creator.role'), 201);
    }

    public function update(UpdateAcademicCalendarRequest $request, AcademicCalendar $calendar)
    {
        $calendar->update($request->validated());

        return response()->json($calendar->fresh()->load('creator.role'));
    }

    public function destroy(AcademicCalendar $calendar)
    {
        $calendar->delete();

        return response()->noContent();
    }

    public function upcoming(Request $request)
    {
        $start = now()->startOfDay();
        $end = now()->copy()->addDays(30)->endOfDay();

        $events = AcademicCalendar::with('creator.role')
            ->when($request->query('department'), fn ($query, $department) => $query->where('department', $department))
            ->whereDate('event_date', '>=', $start)
            ->whereDate('event_date', '<=', $end)
            ->orderBy('event_date')
            ->get();

        return response()->json($events);
    }
}
