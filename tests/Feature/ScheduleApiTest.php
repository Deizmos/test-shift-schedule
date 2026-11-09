<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Shift;
use App\Models\ShiftTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_employees_and_templates_come_from_the_schedule_seed(): void
    {
        $this->getJson('/api/employees')
            ->assertOk()
            ->assertJsonCount(8, 'data')
            ->assertJsonPath('data.0.name', 'Кузнецова Алина')
            ->assertJsonPath('data.0.position', 'агент')
            ->assertJsonPath('data.0.weekly_hours', 24);

        $this->getJson('/api/templates')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Утро')
            ->assertJsonPath('data.0.start_time', '07:00')
            ->assertJsonPath('data.0.end_time', '15:00')
            ->assertJsonPath('data.1.name', 'День')
            ->assertJsonPath('data.1.start_time', '10:00')
            ->assertJsonPath('data.2.name', 'Вечер')
            ->assertJsonPath('data.2.end_time', '23:00');
    }

    public function test_template_assignment_can_be_replaced_by_a_custom_shift(): void
    {
        $employees = Employee::query()->orderBy('id')->take(2)->get();
        $morning = ShiftTemplate::query()->where('name', 'Утро')->firstOrFail();

        $this->postJson('/api/shifts', [
            'template_id' => $morning->id,
            'cells' => [
                ['employee_id' => $employees[0]->id, 'date' => '2026-11-09'],
                ['employee_id' => $employees[1]->id, 'date' => '2026-11-09'],
            ],
        ])->assertCreated()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.start_time', '07:00')
            ->assertJsonPath('data.0.end_time', '15:00')
            ->assertJsonPath('data.0.template_id', $morning->id);

        $this->postJson('/api/shifts', [
            'start_time' => '09:00',
            'end_time' => '17:00',
            'cells' => [
                ['employee_id' => $employees[0]->id, 'date' => '2026-11-09'],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.0.template_id', null)
            ->assertJsonPath('data.0.start_time', '09:00')
            ->assertJsonPath('data.0.end_time', '17:00');

        $this->assertDatabaseCount('shifts', 2);

        $this->getJson('/api/shifts?from=2026-11-09&to=2026-11-09')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/shifts?from=2026-11-10&to=2026-11-10')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_shift_can_be_updated_deleted_and_moved_onto_an_occupied_cell(): void
    {
        $employees = Employee::query()->orderBy('id')->take(2)->get();
        $day = ShiftTemplate::query()->where('name', 'День')->firstOrFail();

        $this->postJson('/api/shifts', [
            'template_id' => $day->id,
            'cells' => [
                ['employee_id' => $employees[0]->id, 'date' => '2026-11-09'],
                ['employee_id' => $employees[1]->id, 'date' => '2026-11-09'],
            ],
        ])->assertCreated();

        $source = Shift::query()->where('employee_id', $employees[1]->id)->firstOrFail();

        $this->putJson('/api/shifts/'.$source->id, [
            'start_time' => '12:00',
            'end_time' => '20:00',
        ])->assertOk()
            ->assertJsonPath('data.template_id', null)
            ->assertJsonPath('data.start_time', '12:00');

        $this->postJson('/api/shifts/'.$source->id.'/transfer', [
            'employee_id' => $employees[0]->id,
            'date' => '2026-11-09',
        ])->assertOk()
            ->assertJsonPath('data.employee_id', $employees[0]->id)
            ->assertJsonPath('data.start_time', '12:00');

        $this->assertDatabaseCount('shifts', 1);

        $this->deleteJson('/api/shifts/'.$source->id)->assertNoContent();
        $this->assertDatabaseCount('shifts', 0);
    }

    public function test_assignment_requires_a_cell_and_a_real_time_range(): void
    {
        $this->postJson('/api/shifts', [])->assertUnprocessable();
        $this->getJson('/api/shifts')->assertUnprocessable();

        $employee = Employee::query()->firstOrFail();

        $this->postJson('/api/shifts', [
            'start_time' => '09:00',
            'end_time' => '09:00',
            'cells' => [
                ['employee_id' => $employee->id, 'date' => '2026-11-09'],
            ],
        ])->assertUnprocessable();
    }
}
