<?php

namespace App\Services;

use App\Models\Shift;
use App\Models\ShiftTemplate;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ShiftScheduler
{
    /**
     * Assign one shift per cell. A cell that already has a shift is replaced.
     *
     * @param  list<array{employee_id: int, date: string}>  $cells
     * @return Collection<int, Shift>
     */
    public function assign(array $cells, ?ShiftTemplate $template, ?string $startTime, ?string $endTime): Collection
    {
        return DB::transaction(function () use ($cells, $template, $startTime, $endTime): Collection {
            $shifts = new Collection;

            foreach ($cells as $cell) {
                $shifts->push(Shift::query()->updateOrCreate(
                    [
                        'employee_id' => $cell['employee_id'],
                        'date' => $cell['date'],
                    ],
                    [
                        'template_id' => $template?->id,
                        'start_time' => $template?->start_time ?? $startTime,
                        'end_time' => $template?->end_time ?? $endTime,
                    ],
                ));
            }

            return $shifts->each(fn (Shift $shift) => $shift->load('template'));
        });
    }

    /**
     * Move a shift onto another cell. A shift already sitting there is removed.
     */
    public function transfer(Shift $shift, int $employeeId, string $date): Shift
    {
        return DB::transaction(function () use ($shift, $employeeId, $date): Shift {
            Shift::query()
                ->where('employee_id', $employeeId)
                ->whereDate('date', $date)
                ->whereKeyNot($shift->id)
                ->delete();

            $shift->update([
                'employee_id' => $employeeId,
                'date' => $date,
            ]);

            return $shift->refresh()->load('template');
        });
    }
}
