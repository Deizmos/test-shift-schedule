import { assignCustom as postCustom, assignTemplate as postTemplate, deleteShift, fetchEmployees, fetchShifts, fetchTemplates, transferShift as postTransfer, type ShiftCell } from '@/api/schedule';
import { addDays, addMonths, formatIsoDate, formatMonthTitle, formatWeekTitle, monthDates, startOfMonth, startOfWeek, weekDates } from '@/schedule/week';
import type { Employee, Shift, ShiftTemplate } from '@/types/schedule';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

function cellKey(employeeId: number, date: string): string {
    return `${employeeId}:${date}`;
}

function parseCellKey(key: string): ShiftCell {
    const separator = key.indexOf(':');

    return {
        employee_id: Number(key.slice(0, separator)),
        date: key.slice(separator + 1),
    };
}

function errorMessage(caught: unknown): string {
    return caught instanceof Error ? caught.message : 'Не удалось загрузить график';
}

export const useScheduleStore = defineStore('schedule', () => {
    const employees = ref<Employee[]>([]);
    const templates = ref<ShiftTemplate[]>([]);
    const shifts = ref<Shift[]>([]);
    const query = ref('');
    const view = ref<'week' | 'month'>('week');
    const anchor = ref(new Date());
    const loading = ref(false);
    const shiftsLoading = ref(false);
    const error = ref<string | null>(null);
    const selecting = ref(false);
    const selectedKeys = ref<string[]>([]);
    const selectionTemplateOpen = ref(false);

    let shiftsRequest = 0;
    let revision = 0;

    const days = computed(() => (view.value === 'month' ? monthDates(startOfMonth(anchor.value)) : weekDates(startOfWeek(anchor.value))));

    const periodTitle = computed(() =>
        view.value === 'month' ? formatMonthTitle(startOfMonth(anchor.value)) : formatWeekTitle(startOfWeek(anchor.value)),
    );

    const visibleEmployees = computed(() => {
        const needle = query.value.trim().toLocaleLowerCase('ru-RU');

        if (needle === '') {
            return employees.value;
        }

        return employees.value.filter((employee) => employee.name.toLocaleLowerCase('ru-RU').includes(needle));
    });

    const shiftsByCell = computed(() => {
        const lookup = new Map<string, Shift>();

        for (const shift of shifts.value) {
            lookup.set(cellKey(shift.employee_id, shift.date), shift);
        }

        return lookup;
    });

    const coveredDates = computed(() => new Set(shifts.value.map((shift) => shift.date)));

    const selectedCells = computed(() => selectedKeys.value.map(parseCellKey));

    const selectionStats = computed(() => ({
        cells: selectedCells.value.length,
        employees: new Set(selectedCells.value.map((cell) => cell.employee_id)).size,
        days: new Set(selectedCells.value.map((cell) => cell.date)).size,
    }));

    function shiftOn(employeeId: number, date: string): Shift | undefined {
        return shiftsByCell.value.get(cellKey(employeeId, date));
    }

    function isDateCovered(date: string): boolean {
        return coveredDates.value.has(date);
    }

    function isSelected(employeeId: number, date: string): boolean {
        return selectedKeys.value.includes(cellKey(employeeId, date));
    }

    function beginSelecting(): void {
        selecting.value = true;
    }

    function replaceSelection(cells: ShiftCell[]): void {
        selecting.value = true;
        selectionTemplateOpen.value = false;
        selectedKeys.value = [...new Set(cells.map((cell) => cellKey(cell.employee_id, cell.date)))];
    }

    function toggleSelection(cell: ShiftCell): void {
        selecting.value = true;
        selectionTemplateOpen.value = false;
        const key = cellKey(cell.employee_id, cell.date);

        selectedKeys.value = selectedKeys.value.includes(key)
            ? selectedKeys.value.filter((item) => item !== key)
            : [...selectedKeys.value, key];
    }

    function clearSelection(): void {
        selecting.value = false;
        selectedKeys.value = [];
        selectionTemplateOpen.value = false;
    }

    function sharedSelectionTime(): { start: string; end: string } | null {
        const ranges = new Set<string>();

        for (const cell of selectedCells.value) {
            const shift = shiftOn(cell.employee_id, cell.date);

            if (shift !== undefined) {
                ranges.add(`${shift.start_time}|${shift.end_time}`);
            }
        }

        if (ranges.size !== 1) {
            return null;
        }

        const range = [...ranges][0] ?? '';
        const separator = range.indexOf('|');

        return {
            start: range.slice(0, separator),
            end: range.slice(separator + 1),
        };
    }

    function setView(next: 'week' | 'month'): void {
        if (view.value === next) {
            return;
        }

        clearSelection();
        view.value = next;
        void loadShifts();
    }

    function showPrevious(): void {
        clearSelection();
        anchor.value = view.value === 'month' ? addMonths(anchor.value, -1) : addDays(anchor.value, -7);
        void loadShifts();
    }

    function showNext(): void {
        clearSelection();
        anchor.value = view.value === 'month' ? addMonths(anchor.value, 1) : addDays(anchor.value, 7);
        void loadShifts();
    }

    async function load(): Promise<void> {
        loading.value = true;
        error.value = null;

        try {
            const [employeeRows, templateRows] = await Promise.all([fetchEmployees(), fetchTemplates()]);

            employees.value = employeeRows;
            templates.value = templateRows;
            pruneSelection();
            await loadShifts();
        } catch (caught) {
            error.value = errorMessage(caught);
        } finally {
            loading.value = false;
        }
    }

    async function loadShifts(): Promise<void> {
        const request = ++shiftsRequest;
        const revisionAtStart = revision;
        const period = days.value;
        const firstDay = period[0];
        const lastDay = period[period.length - 1];

        if (firstDay === undefined || lastDay === undefined) {
            return;
        }

        shiftsLoading.value = true;

        try {
            const shiftRows = await fetchShifts(formatIsoDate(firstDay), formatIsoDate(lastDay));

            if (request !== shiftsRequest || revision !== revisionAtStart) {
                return;
            }

            shifts.value = shiftRows;
            error.value = null;
        } catch (caught) {
            if (request !== shiftsRequest) {
                return;
            }

            error.value = errorMessage(caught);
        } finally {
            if (request === shiftsRequest) {
                shiftsLoading.value = false;
            }
        }
    }

    async function assignTemplate(templateId: number, cells: ShiftCell[]): Promise<boolean> {
        try {
            const saved = await postTemplate(templateId, cells);

            rememberShifts(saved);
            error.value = null;

            return true;
        } catch (caught) {
            error.value = errorMessage(caught);

            return false;
        }
    }

    async function assignCustom(startTime: string, endTime: string, cells: ShiftCell[]): Promise<boolean> {
        if (cells.length === 0) {
            return false;
        }

        try {
            const saved = await postCustom(startTime, endTime, cells);

            rememberShifts(saved);
            error.value = null;

            return true;
        } catch (caught) {
            error.value = errorMessage(caught);

            return false;
        }
    }

    async function transferShift(shiftId: number, employeeId: number, date: string): Promise<boolean> {
        const source = shifts.value.find((shift) => shift.id === shiftId);

        if (source === undefined) {
            return false;
        }

        if (source.employee_id === employeeId && source.date === date) {
            return true;
        }

        try {
            const moved = await postTransfer(shiftId, employeeId, date);

            forgetCells([
                { employee_id: source.employee_id, date: source.date },
                { employee_id: employeeId, date },
            ]);
            rememberShifts([moved]);
            error.value = null;

            return true;
        } catch (caught) {
            const message = errorMessage(caught);

            error.value = message;
            await loadShifts();
            error.value = message;

            return false;
        }
    }

    async function removeSelectedShifts(): Promise<boolean> {
        const existing = selectedCells.value
            .map((cell) => shiftOn(cell.employee_id, cell.date))
            .filter((shift): shift is Shift => shift !== undefined);

        if (existing.length === 0) {
            return true;
        }

        try {
            for (const shift of existing) {
                await deleteShift(shift.id);
            }

            forgetCells(existing.map((shift) => ({ employee_id: shift.employee_id, date: shift.date })));
            error.value = null;

            return true;
        } catch (caught) {
            const message = errorMessage(caught);

            error.value = message;
            await loadShifts();
            error.value = message;

            return false;
        }
    }

    function rememberShifts(incoming: Shift[]): void {
        revision += 1;
        const lookup = new Map(shifts.value.map((shift) => [cellKey(shift.employee_id, shift.date), shift]));

        for (const shift of incoming) {
            lookup.set(cellKey(shift.employee_id, shift.date), shift);
        }

        shifts.value = [...lookup.values()];
    }

    function forgetCells(cells: ShiftCell[]): void {
        revision += 1;
        const drop = new Set(cells.map((cell) => cellKey(cell.employee_id, cell.date)));

        shifts.value = shifts.value.filter((shift) => !drop.has(cellKey(shift.employee_id, shift.date)));
    }

    function pruneSelection(): void {
        const ids = new Set(employees.value.map((employee) => employee.id));

        selectedKeys.value = selectedKeys.value.filter((key) => ids.has(parseCellKey(key).employee_id));
    }

    return {
        employees,
        templates,
        shifts,
        query,
        view,
        periodTitle,
        loading,
        shiftsLoading,
        error,
        selecting,
        selectedCells,
        selectionStats,
        selectionTemplateOpen,
        days,
        visibleEmployees,
        shiftOn,
        isDateCovered,
        isSelected,
        beginSelecting,
        replaceSelection,
        toggleSelection,
        clearSelection,
        sharedSelectionTime,
        setView,
        showPrevious,
        showNext,
        load,
        assignTemplate,
        assignCustom,
        transferShift,
        removeSelectedShifts,
    };
});
