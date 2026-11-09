<?php

namespace App\Models;

use App\Models\Concerns\HasClockTimes;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'start_time', 'end_time', 'color', 'sort_order'])]
class ShiftTemplate extends Model
{
    use HasClockTimes;

    /**
     * @return HasMany<Shift, $this>
     */
    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class, 'template_id');
    }
}
