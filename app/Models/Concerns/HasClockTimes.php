<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Casts\Attribute;

trait HasClockTimes
{
    protected function startTime(): Attribute
    {
        return $this->clockTime();
    }

    protected function endTime(): Attribute
    {
        return $this->clockTime();
    }

    private function clockTime(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): ?string => $value === null ? null : substr($value, 0, 5),
            set: fn (?string $value): ?string => $value !== null && strlen($value) === 5 ? $value.':00' : $value,
        );
    }
}
