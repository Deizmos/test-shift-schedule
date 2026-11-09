<script setup lang="ts">
import DayCell from '@/kit/DayCell.vue';
import EmployeeCell from '@/kit/EmployeeCell.vue';
import { shiftHoursLabel, shiftTimeLabel, shiftTone } from '@/schedule/shiftPresentation';
import TemplateMenu from '@/schedule/TemplateMenu.vue';
import { dayLabel, formatIsoDate } from '@/schedule/week';
import { useScheduleStore } from '@/stores/schedule';
import type { Employee, ShiftTone } from '@/types/schedule';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

type OpenMenu = {
    mode: 'cell' | 'day';
    employeeId: number | null;
    date: string;
    title: string;
    subtitle: string;
    top: number;
    left: number;
};

const store = useScheduleStore();
const { days, visibleEmployees, employees, templates, query, shiftsLoading, selecting, view } = storeToRefs(store);
const mobileQuery = window.matchMedia('(max-width: 767px)');
const belowWideQuery = window.matchMedia('(max-width: 1099px)');
const band = ref<'mobile' | 'tablet' | 'desktop'>(readBand());
const menu = ref<OpenMenu | null>(null);
const saving = ref(false);
const menuPanel = useTemplateRef('menuPanel');
const scroller = useTemplateRef('scroller');
let menuAnchor: HTMLElement | null = null;

type CellPoint = {
    employeeId: number;
    date: string;
};

let anchor: CellPoint | null = null;
let drag: { pointerId: number; startX: number; startY: number; origin: CellPoint; moved: boolean } | null = null;
let dragMoved = false;
let movingShiftId: number | null = null;
const moveSource = ref<CellPoint | null>(null);
const moveTarget = ref<CellPoint | null>(null);

const gridStyle = computed(() => {
    const month = view.value === 'month';
    const employee = month
        ? { mobile: '132px', tablet: '180px', desktop: '200px' }[band.value]
        : { mobile: '132px', tablet: '188px', desktop: '240px' }[band.value];
    const day = month
        ? { mobile: 'minmax(36px, 1fr)', tablet: 'minmax(44px, 1fr)', desktop: 'minmax(44px, 1fr)' }[band.value]
        : { mobile: 'minmax(88px, 1fr)', tablet: 'minmax(96px, 1fr)', desktop: 'minmax(0, 1fr)' }[band.value];
    const columns = month ? days.value.length : 7;
    const minWidth = month ? undefined : { mobile: '748px', tablet: '860px', desktop: '920px' }[band.value];

    return {
        gridTemplateColumns: `${employee} repeat(${columns}, ${day})`,
        minWidth,
    };
});

function readBand(): 'mobile' | 'tablet' | 'desktop' {
    if (mobileQuery.matches) {
        return 'mobile';
    }

    if (belowWideQuery.matches) {
        return 'tablet';
    }

    return 'desktop';
}

function syncBand(): void {
    band.value = readBand();
}

const activeTemplateId = computed(() => {
    const current = menu.value;

    if (current === null) {
        return null;
    }

    if (current.mode === 'cell' && current.employeeId !== null) {
        return store.shiftOn(current.employeeId, current.date)?.template_id ?? null;
    }

    const templateIds = employees.value.map((employee) => store.shiftOn(employee.id, current.date)?.template_id ?? null);

    if (templateIds.length === 0 || templateIds.some((templateId) => templateId !== templateIds[0])) {
        return null;
    }

    return templateIds[0];
});

function cellAttrs(employee: Employee, day: Date): {
    state: 'empty' | 'filled';
    time?: string;
    hours?: string;
    tone?: ShiftTone;
    label: string;
} {
    const dateKey = formatIsoDate(day);
    const shift = store.shiftOn(employee.id, dateKey);
    const date = dayLabel(day);
    const marked = store.isSelected(employee.id, dateKey) ? ', ячейка выделена' : '';

    if (shift === undefined) {
        return {
            state: 'empty',
            label: `${employee.name}, ${date}${marked}, выбрать шаблон смены`,
        };
    }

    const time = shiftTimeLabel(shift);

    return {
        state: 'filled',
        time,
        hours: shiftHoursLabel(shift),
        tone: shiftTone(shift),
        label: `${employee.name}, ${date}, смена ${time}${marked}, изменить шаблон`,
    };
}

function isCellMenuOpen(employee: Employee, day: Date): boolean {
    const current = menu.value;

    return current?.mode === 'cell' && current.employeeId === employee.id && current.date === formatIsoDate(day);
}

function weekdayHeader(day: Date): string {
    const label = day.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '').toLocaleLowerCase('ru-RU');

    return `${label} ${day.getDate()}`;
}

function rowTone(index: number): string {
    return index % 2 === 1 ? 'bg-row' : 'bg-white';
}

function coverageLabel(day: Date): string {
    const date = dayLabel(day);
    const count = store.coverageCount(formatIsoDate(day));

    return `Покрытие, ${date}: ${count}`;
}

function isDayMenuOpen(day: Date): boolean {
    const current = menu.value;

    return current?.mode === 'day' && current.date === formatIsoDate(day);
}

function openCellMenu(employee: Employee, day: Date, event: MouseEvent): void {
    const date = formatIsoDate(day);

    if (isCellMenuOpen(employee, day)) {
        closeMenu();

        return;
    }

    openMenu(event.currentTarget, {
        mode: 'cell',
        employeeId: employee.id,
        date,
        title: employee.name,
        subtitle: dayLabel(day),
    });
}

function openDayMenu(day: Date, event: MouseEvent): void {
    if (isDayMenuOpen(day)) {
        closeMenu();

        return;
    }

    openMenu(event.currentTarget, {
        mode: 'day',
        employeeId: null,
        date: formatIsoDate(day),
        title: 'Всем сотрудникам',
        subtitle: dayLabel(day),
    });
}

function openMenu(anchor: EventTarget | null, next: Omit<OpenMenu, 'top' | 'left'>): void {
    if (!(anchor instanceof HTMLElement)) {
        return;
    }

    menuAnchor = anchor;
    const placed = placeMenu(anchor);
    menu.value = { ...next, ...placed };
}

function placeMenu(anchor: HTMLElement): { top: number; left: number } {
    const rect = anchor.getBoundingClientRect();
    const panel = menuPanel.value?.getBoundingClientRect();
    const width = panel?.width ?? 240;
    const height = panel?.height ?? 220;
    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + width > window.innerWidth - 8) {
        left = window.innerWidth - width - 8;
    }

    if (top + height > window.innerHeight - 8) {
        top = rect.top - height - 8;
    }

    return {
        top: Math.max(8, top),
        left: Math.max(8, left),
    };
}

watch(
    () => (menu.value === null ? null : `${menu.value.mode}:${menu.value.employeeId}:${menu.value.date}`),
    async (key) => {
        if (key === null) {
            return;
        }

        await nextTick();
        repositionMenu();
    },
);

function repositionMenu(): void {
    if (menu.value === null || menuAnchor === null) {
        return;
    }

    const placed = placeMenu(menuAnchor);
    menu.value = { ...menu.value, ...placed };
}

function closeMenu(): void {
    const anchor = menuAnchor;

    menu.value = null;
    menuAnchor = null;
    anchor?.focus();
}

async function chooseTemplate(templateId: number): Promise<void> {
    const current = menu.value;

    if (current === null || saving.value) {
        return;
    }

    const cells =
        current.mode === 'cell' && current.employeeId !== null
            ? [{ employee_id: current.employeeId, date: current.date }]
            : employees.value.map((employee) => ({ employee_id: employee.id, date: current.date }));

    if (cells.length === 0) {
        return;
    }

    saving.value = true;
    const saved = await store.assignTemplate(templateId, cells);
    saving.value = false;

    if (saved) {
        closeMenu();
    }
}

function cellPoint(employee: Employee, day: Date): CellPoint {
    return { employeeId: employee.id, date: formatIsoDate(day) };
}

function cellFromPointer(x: number, y: number): CellPoint | null {
    const element = document.elementFromPoint(x, y);
    const cell = element?.closest('[data-schedule-cell]');

    if (!(cell instanceof HTMLElement)) {
        return null;
    }

    const employeeId = Number(cell.dataset.employeeId);
    const date = cell.dataset.date;

    if (!Number.isInteger(employeeId) || date === undefined || date === '') {
        return null;
    }

    return { employeeId, date };
}

function rectangle(from: CellPoint, to: CellPoint): { employee_id: number; date: string }[] {
    const startRow = visibleEmployees.value.findIndex((employee) => employee.id === from.employeeId);
    const endRow = visibleEmployees.value.findIndex((employee) => employee.id === to.employeeId);
    const startColumn = days.value.findIndex((day) => formatIsoDate(day) === from.date);
    const endColumn = days.value.findIndex((day) => formatIsoDate(day) === to.date);

    if (startRow < 0 || endRow < 0 || startColumn < 0 || endColumn < 0) {
        return [{ employee_id: to.employeeId, date: to.date }];
    }

    const cells: { employee_id: number; date: string }[] = [];

    for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row += 1) {
        for (let column = Math.min(startColumn, endColumn); column <= Math.max(startColumn, endColumn); column += 1) {
            const employee = visibleEmployees.value[row];
            const day = days.value[column];

            if (employee === undefined || day === undefined) {
                continue;
            }

            cells.push({ employee_id: employee.id, date: formatIsoDate(day) });
        }
    }

    return cells;
}

function selectByPointer(cell: CellPoint, range: boolean): void {
    closeMenu();

    if (range) {
        const origin = anchor ?? cell;

        anchor = origin;
        store.replaceSelection(rectangle(origin, cell));

        return;
    }

    anchor = cell;
    store.toggleSelection({ employee_id: cell.employeeId, date: cell.date });
}

function sameCell(left: CellPoint, right: CellPoint): boolean {
    return left.employeeId === right.employeeId && left.date === right.date;
}

function canMoveShift(employee: Employee, day: Date, event: PointerEvent): boolean {
    return store.shiftOn(employee.id, formatIsoDate(day)) !== undefined && !selecting.value && !event.shiftKey && !event.metaKey && !event.ctrlKey;
}

function onCellPointerDown(employee: Employee, day: Date, event: PointerEvent): void {
    dragMoved = false;

    if (event.button !== 0 || event.pointerType !== 'mouse' || canMoveShift(employee, day, event)) {
        return;
    }

    drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        origin: cellPoint(employee, day),
        moved: false,
    };

    if (event.currentTarget instanceof HTMLElement) {
        event.currentTarget.setPointerCapture(event.pointerId);
    }
}

function onCellPointerMove(event: PointerEvent): void {
    if (drag === null || event.pointerId !== drag.pointerId) {
        return;
    }

    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);

    if (!drag.moved && distance < 5) {
        return;
    }

    if (!drag.moved) {
        drag.moved = true;
        dragMoved = true;
        anchor = drag.origin;
        closeMenu();
        store.replaceSelection([{ employee_id: drag.origin.employeeId, date: drag.origin.date }]);
    }

    const hit = cellFromPointer(event.clientX, event.clientY);

    if (hit !== null) {
        store.replaceSelection(rectangle(drag.origin, hit));
    }
}

function onCellPointerUp(event: PointerEvent): void {
    if (drag === null || event.pointerId !== drag.pointerId) {
        return;
    }

    if (drag.moved) {
        dragMoved = true;
    }

    drag = null;
}

function clearMove(): void {
    movingShiftId = null;
    moveSource.value = null;
    moveTarget.value = null;
    document.body.style.cursor = '';
}

function onShiftDragStart(employee: Employee, day: Date, event: DragEvent): void {
    const shift = store.shiftOn(employee.id, formatIsoDate(day));

    if (shift === undefined || selecting.value || event.shiftKey || event.metaKey || event.ctrlKey) {
        event.preventDefault();

        return;
    }

    movingShiftId = shift.id;
    moveSource.value = cellPoint(employee, day);
    dragMoved = true;
    closeMenu();
    document.body.style.cursor = 'grabbing';
    event.dataTransfer?.setData('text/plain', String(shift.id));

    if (event.dataTransfer !== null) {
        event.dataTransfer.effectAllowed = 'move';
    }
}

function onShiftDragOver(employee: Employee, day: Date, event: DragEvent): void {
    if (movingShiftId === null) {
        return;
    }

    event.preventDefault();

    if (event.dataTransfer !== null) {
        event.dataTransfer.dropEffect = 'move';
    }

    moveTarget.value = cellPoint(employee, day);
}

function onShiftDrop(employee: Employee, day: Date, event: DragEvent): void {
    event.preventDefault();
    const transferred = Number(event.dataTransfer?.getData('text/plain'));
    const shiftId = Number.isInteger(transferred) && transferred > 0 ? transferred : movingShiftId;
    const target = cellPoint(employee, day);
    const source = moveSource.value ?? (shiftId === null ? null : shiftPoint(shiftId));

    clearMove();

    if (shiftId === null || source === null || sameCell(source, target)) {
        return;
    }

    void store.transferShift(shiftId, target.employeeId, target.date);
}

function shiftPoint(shiftId: number): CellPoint | null {
    const shift = store.shifts.find((item) => item.id === shiftId);

    if (shift === undefined) {
        return null;
    }

    return { employeeId: shift.employee_id, date: shift.date };
}

function onCellClick(employee: Employee, day: Date, event: MouseEvent): void {
    if (dragMoved) {
        dragMoved = false;

        return;
    }

    const modifier = event.shiftKey || event.metaKey || event.ctrlKey;

    if (modifier || selecting.value) {
        selectByPointer(cellPoint(employee, day), event.shiftKey && !event.metaKey && !event.ctrlKey);

        return;
    }

    openCellMenu(employee, day, event);
}

function onPointerDown(event: PointerEvent): void {
    if (menu.value === null) {
        return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
        return;
    }

    if (menuPanel.value?.contains(target) || menuAnchor?.contains(target)) {
        return;
    }

    closeMenu();
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
        return;
    }

    if (menu.value !== null) {
        closeMenu();

        return;
    }

    if (store.selectionTemplateOpen) {
        store.selectionTemplateOpen = false;

        return;
    }

    if (selecting.value || store.selectedCells.length > 0) {
        anchor = null;
        store.clearSelection();
    }
}

watch(
    () => store.selectedCells.length,
    (count) => {
        if (count === 0) {
            anchor = null;
        }
    },
);

watch(selecting, (active) => {
    if (active) {
        closeMenu();
    }
});

onMounted(() => {
    syncBand();
    mobileQuery.addEventListener('change', syncBand);
    belowWideQuery.addEventListener('change', syncBand);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', repositionMenu);
    scroller.value?.addEventListener('scroll', repositionMenu);
});

onUnmounted(() => {
    mobileQuery.removeEventListener('change', syncBand);
    belowWideQuery.removeEventListener('change', syncBand);
    document.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('resize', repositionMenu);
    scroller.value?.removeEventListener('scroll', repositionMenu);
    clearMove();
});
</script>

<template>
    <div ref="scroller" class="overflow-x-auto overscroll-x-contain pb-1" :class="[shiftsLoading ? 'opacity-60' : 'opacity-100', moveSource ? 'cursor-grabbing' : '']" :aria-busy="shiftsLoading">
        <div
            class="grid select-none"
            :class="view === 'month' ? 'min-w-max' : ''"
            :style="gridStyle"
            role="grid"
            :aria-label="view === 'month' ? 'График на месяц' : 'График на неделю'"
        >
            <div role="row" class="contents">
                <div role="columnheader" class="sticky left-0 z-10 flex items-end border-b border-line bg-white px-2 pb-2 text-xs text-muted md:px-4 md:pb-3 md:text-sm max-wide:shadow-[4px_0_8px_-6px_rgba(28,29,34,0.35)]">Сотрудник</div>
                <div v-for="day in days" :key="formatIsoDate(day)" role="columnheader" class="flex items-end justify-center border-b border-line px-0.5 pb-2 md:px-1 md:pb-3">
                    <button
                        type="button"
                        class="whitespace-nowrap text-muted"
                        :class="view === 'month' ? 'text-[11px]' : 'text-[11px] md:text-sm'"
                        :aria-label="`Назначить смену на ${dayLabel(day)}`"
                        aria-haspopup="menu"
                        :aria-expanded="isDayMenuOpen(day)"
                        @click="openDayMenu(day, $event)"
                    >
                        {{ weekdayHeader(day) }}
                    </button>
                </div>
            </div>

            <p v-if="visibleEmployees.length === 0" class="col-span-full border-r border-b border-line px-4 py-6 text-sm text-muted" role="status">
                {{ query.trim() ? 'Нет сотрудников с таким ФИО.' : 'В графике пока нет сотрудников.' }}
            </p>

            <div v-for="(employee, rowIndex) in visibleEmployees" :key="employee.id" role="row" class="contents">
                <div role="rowheader" class="sticky left-0 z-10 flex min-w-0 items-center px-2 md:px-4 max-wide:shadow-[4px_0_8px_-6px_rgba(28,29,34,0.35)]" :class="rowTone(rowIndex)">
                    <EmployeeCell
                        :name="employee.name"
                        :position="employee.position"
                        :hours="`${employee.weekly_hours} ч`"
                        :avatar-url="employee.avatar_url"
                    />
                </div>
                <div
                    v-for="day in days"
                    :key="formatIsoDate(day)"
                    role="gridcell"
                    :class="[rowTone(rowIndex), moveTarget && moveSource && sameCell(moveTarget, cellPoint(employee, day)) && !sameCell(moveSource, moveTarget) ? 'ring-2 ring-blue ring-inset' : '']"
                    :aria-selected="store.isSelected(employee.id, formatIsoDate(day))"
                    @dragenter.prevent
                    @dragover="onShiftDragOver(employee, day, $event)"
                    @drop="onShiftDrop(employee, day, $event)"
                >
                    <DayCell
                        v-bind="cellAttrs(employee, day)"
                        :view="view"
                        surface="grid"
                        :draggable="store.shiftOn(employee.id, formatIsoDate(day)) !== undefined && !selecting"
                        :class="[
                            store.shiftOn(employee.id, formatIsoDate(day)) !== undefined && !selecting ? 'cursor-grab' : '',
                            moveSource && sameCell(moveSource, cellPoint(employee, day)) ? 'opacity-40' : '',
                        ]"
                        @dragstart="onShiftDragStart(employee, day, $event)"
                        @dragend="clearMove"
                        data-schedule-cell
                        :data-employee-id="employee.id"
                        :data-date="formatIsoDate(day)"
                        :selected="store.isSelected(employee.id, formatIsoDate(day))"
                        :aria-haspopup="selecting ? undefined : 'menu'"
                        :aria-expanded="isCellMenuOpen(employee, day)"
                        :aria-pressed="store.isSelected(employee.id, formatIsoDate(day))"
                        @pointerdown="onCellPointerDown(employee, day, $event)"
                        @pointermove="onCellPointerMove"
                        @pointerup="onCellPointerUp"
                        @pointercancel="onCellPointerUp"
                        @click="onCellClick(employee, day, $event)"
                    />
                </div>
            </div>

            <div role="row" class="contents">
                <div class="sticky left-0 z-10 flex h-10 items-center bg-white px-2 text-xs text-muted md:h-12 md:px-4 md:text-sm max-wide:shadow-[4px_0_8px_-6px_rgba(28,29,34,0.35)]">Покрытие</div>
                <div
                    v-for="day in days"
                    :key="`cover-${formatIsoDate(day)}`"
                    class="flex h-10 items-center justify-center text-xs font-medium md:h-12"
                    :class="store.coverageCount(formatIsoDate(day)) > 0 ? 'bg-blue-soft text-blue' : 'bg-cover-empty text-cover-text'"
                    :aria-label="coverageLabel(day)"
                >
                    {{ store.coverageCount(formatIsoDate(day)) }}
                </div>
            </div>
        </div>
    </div>

    <div v-if="menu" ref="menuPanel" class="fixed z-30" :style="{ top: `${menu.top}px`, left: `${menu.left}px` }">
        <TemplateMenu
            :title="menu.title"
            :subtitle="menu.subtitle"
            :templates="templates"
            :active-template-id="activeTemplateId"
            :saving="saving"
            @select="chooseTemplate"
        />
    </div>
</template>
