<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShiftsRequest;
use App\Http\Requests\TransferShiftRequest;
use App\Http\Requests\UpdateShiftRequest;
use App\Http\Resources\ShiftResource;
use App\Models\Shift;
use App\Models\ShiftTemplate;
use App\Services\ShiftScheduler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ShiftController extends Controller
{
    public function __construct(private readonly ShiftScheduler $scheduler) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $period = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $shifts = Shift::query()
            ->with('template')
            ->whereDate('date', '>=', $period['from'])
            ->whereDate('date', '<=', $period['to'])
            ->orderBy('date')
            ->orderBy('employee_id')
            ->get();

        return ShiftResource::collection($shifts);
    }

    public function store(StoreShiftsRequest $request): JsonResponse
    {
        $template = $request->filled('template_id')
            ? ShiftTemplate::query()->findOrFail($request->integer('template_id'))
            : null;

        $shifts = $this->scheduler->assign(
            $request->validated('cells'),
            $template,
            $request->input('start_time'),
            $request->input('end_time'),
        );

        return ShiftResource::collection($shifts)
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateShiftRequest $request, Shift $shift): ShiftResource
    {
        if ($request->filled('template_id')) {
            $template = ShiftTemplate::query()->findOrFail($request->integer('template_id'));
            $shift->update([
                'template_id' => $template->id,
                'start_time' => $template->start_time,
                'end_time' => $template->end_time,
            ]);
        } else {
            $shift->update([
                'template_id' => null,
                'start_time' => $request->string('start_time')->toString(),
                'end_time' => $request->string('end_time')->toString(),
            ]);
        }

        return new ShiftResource($shift->load('template'));
    }

    public function destroy(Shift $shift): Response
    {
        $shift->delete();

        return response()->noContent();
    }

    public function transfer(TransferShiftRequest $request, Shift $shift): ShiftResource
    {
        $moved = $this->scheduler->transfer(
            $shift,
            $request->integer('employee_id'),
            $request->string('date')->toString(),
        );

        return new ShiftResource($moved);
    }
}
