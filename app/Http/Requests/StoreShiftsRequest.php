<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreShiftsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cells' => ['required', 'array', 'min:1'],
            'cells.*.employee_id' => ['required', 'integer', 'exists:employees,id'],
            'cells.*.date' => ['required', 'date_format:Y-m-d'],
            'template_id' => ['required_without:start_time', 'nullable', 'integer', 'exists:shift_templates,id'],
            'start_time' => ['required_without:template_id', 'date_format:H:i'],
            'end_time' => ['required_with:start_time', 'date_format:H:i', 'different:start_time'],
        ];
    }
}
