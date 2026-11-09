<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\ShiftTemplate;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    /**
     * Seed employees and shift templates from the Figma schedule screen.
     */
    public function run(): void
    {
        $names = [
            'Кузнецова Алина',
            'Волков Тимур',
            'Морозова Виктория',
            'Соколов Артём',
            'Лебедева Полина',
            'Новиков Кирилл',
            'Ерохина Дарья',
            'Гаврилов Егор',
        ];

        foreach ($names as $name) {
            Employee::query()->updateOrCreate(
                ['name' => $name],
                ['position' => 'агент', 'weekly_hours' => 24],
            );
        }

        $templates = [
            ['name' => 'Утро', 'start_time' => '07:00', 'end_time' => '15:00', 'color' => '#E4EBFF', 'sort_order' => 1],
            ['name' => 'День', 'start_time' => '10:00', 'end_time' => '18:00', 'color' => '#E3F6EF', 'sort_order' => 2],
            ['name' => 'Вечер', 'start_time' => '15:00', 'end_time' => '23:00', 'color' => '#EEE6FF', 'sort_order' => 3],
        ];

        foreach ($templates as $template) {
            ShiftTemplate::query()->updateOrCreate(
                ['name' => $template['name']],
                $template,
            );
        }
    }
}
