<script setup lang="ts">
import SelectionBar from '@/kit/SelectionBar.vue';
import UiButton from '@/kit/UiButton.vue';
import UiSearch from '@/kit/UiSearch.vue';
import CustomShiftPanel from '@/schedule/CustomShiftPanel.vue';
import TemplateMenu from '@/schedule/TemplateMenu.vue';
import WeekGrid from '@/schedule/WeekGrid.vue';
import { useScheduleStore } from '@/stores/schedule';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

const store = useScheduleStore();
const { query, view, periodTitle, loading, error, employees, templates, selectionStats, selectionTemplateOpen, selectedCells } = storeToRefs(store);
const periodLabel = periodTitle;
const previousLabel = computed(() => (view.value === 'month' ? 'Предыдущий месяц' : 'Предыдущая неделя'));
const nextLabel = computed(() => (view.value === 'month' ? 'Следующий месяц' : 'Следующая неделя'));
const start = ref('09:00');
const end = ref('18:00');
const saving = ref(false);
const menuPosition = ref({ top: 0, left: 0 });
const panel = useTemplateRef('panel');
const menuPanel = useTemplateRef('menuPanel');

const sameTime = computed(() => start.value !== '' && start.value.slice(0, 5) === end.value.slice(0, 5));
const canApply = computed(() => selectionStats.value.cells > 0 && clock(start.value) !== null && clock(end.value) !== null && !sameTime.value);

const activeTemplateId = computed(() => {
    const templateIds = selectedCells.value.map((cell) => store.shiftOn(cell.employee_id, cell.date)?.template_id ?? null);

    if (templateIds.length === 0 || templateIds.some((templateId) => templateId !== templateIds[0])) {
        return null;
    }

    return templateIds[0];
});

watch(
    () => selectedCells.value.map((cell) => `${cell.employee_id}:${cell.date}`).join(','),
    () => {
        const shared = store.sharedSelectionTime();

        if (shared !== null) {
            start.value = shared.start;
            end.value = shared.end;
        }
    },
);

function clock(value: string): string | null {
    const match = /^(\d{2}):(\d{2})/.exec(value);

    return match === null ? null : `${match[1]}:${match[2]}`;
}

function armSelection(): void {
    store.beginSelecting();
}

function editSelection(): void {
    store.beginSelecting();
    panel.value?.focusStart();
}

function openTemplateMenu(event: MouseEvent): void {
    if (saving.value) {
        return;
    }

    if (selectionTemplateOpen.value) {
        selectionTemplateOpen.value = false;

        return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const width = 240;
    let left = rect.left;

    if (left + width > window.innerWidth - 8) {
        left = window.innerWidth - width - 8;
    }

    menuPosition.value = { top: rect.bottom + 8, left: Math.max(8, left) };
    selectionTemplateOpen.value = true;
}

async function applyCustom(): Promise<void> {
    const startTime = clock(start.value);
    const endTime = clock(end.value);

    if (!canApply.value || startTime === null || endTime === null || saving.value) {
        return;
    }

    saving.value = true;
    await store.assignCustom(startTime, endTime, selectedCells.value);
    saving.value = false;
}

async function applyTemplate(templateId: number): Promise<void> {
    if (saving.value || selectedCells.value.length === 0) {
        return;
    }

    saving.value = true;
    const saved = await store.assignTemplate(templateId, selectedCells.value);
    saving.value = false;

    if (saved) {
        selectionTemplateOpen.value = false;
    }
}

async function removeSelected(): Promise<void> {
    if (saving.value) {
        return;
    }

    saving.value = true;
    await store.removeSelectedShifts();
    saving.value = false;
}

function onPointerDown(event: PointerEvent): void {
    if (!selectionTemplateOpen.value) {
        return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
        return;
    }

    if (menuPanel.value?.contains(target)) {
        return;
    }

    if (target instanceof Element && target.closest('[data-selection-apply]') !== null) {
        return;
    }

    selectionTemplateOpen.value = false;
}

onMounted(() => {
    void store.load();
    document.addEventListener('pointerdown', onPointerDown);
});

onUnmounted(() => {
    document.removeEventListener('pointerdown', onPointerDown);
});
</script>

<template>
    <main class="min-h-screen bg-canvas p-4 text-ink sm:p-6">
        <section class="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-sm">
            <header class="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
                <h1 class="text-base font-semibold">График</h1>
                <UiSearch v-model="query" theme="gray" />
                <div class="flex items-center gap-1">
                    <UiButton variant="quaternary" icon :aria-label="previousLabel" @click="store.showPrevious()">
                        <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </UiButton>
                    <p class="min-w-44 text-center text-sm font-medium whitespace-nowrap">{{ periodLabel }}</p>
                    <UiButton variant="quaternary" icon :aria-label="nextLabel" @click="store.showNext()">
                        <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </UiButton>
                </div>
                <div class="ml-auto flex h-8 items-center rounded-lg bg-zinc-100 p-0.5" role="group" aria-label="Вид графика">
                    <button
                        type="button"
                        class="h-7 rounded-md px-3 text-[13px] font-medium"
                        :class="view === 'week' ? 'bg-ink text-white' : 'text-muted hover:text-ink'"
                        :aria-pressed="view === 'week'"
                        @click="store.setView('week')"
                    >
                        Неделя
                    </button>
                    <button
                        type="button"
                        class="h-7 rounded-md px-3 text-[13px] font-medium"
                        :class="view === 'month' ? 'bg-ink text-white' : 'text-muted hover:text-ink'"
                        :aria-pressed="view === 'month'"
                        @click="store.setView('month')"
                    >
                        Месяц
                    </button>
                </div>
            </header>

            <p v-if="loading" class="px-4 py-6 text-sm text-muted" role="status">Загрузка графика…</p>

            <template v-else>
                <div v-if="error" class="flex flex-wrap items-center gap-3 px-4 py-3" role="alert">
                    <p class="text-sm text-ink">{{ error }}</p>
                    <UiButton variant="secondary" @click="store.load()">Повторить</UiButton>
                </div>
                <template v-if="employees.length > 0">
                    <CustomShiftPanel
                        ref="panel"
                        v-model:start="start"
                        v-model:end="end"
                        :count="selectionStats.cells"
                        :saving="saving"
                        :can-apply="canApply"
                        :same-time="sameTime"
                        @apply="applyCustom"
                        @arm="armSelection"
                    />
                    <div v-if="selectionStats.cells > 0" class="border-b border-line px-4 py-3">
                        <SelectionBar
                            :cells="selectionStats.cells"
                            :employees="selectionStats.employees"
                            :days="selectionStats.days"
                            @apply="openTemplateMenu"
                            @edit="editSelection"
                            @clear="store.clearSelection()"
                            @remove="removeSelected"
                        />
                    </div>
                    <WeekGrid />
                </template>
                <p v-else-if="!error" class="px-4 py-6 text-sm text-muted">В графике пока нет сотрудников.</p>
            </template>
        </section>
        <div v-if="selectionTemplateOpen" ref="menuPanel" class="fixed z-30" :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }">
            <TemplateMenu
                title="Выделенные ячейки"
                :subtitle="`${selectionStats.cells} яч.`"
                :templates="templates"
                :active-template-id="activeTemplateId"
                :saving="saving"
                @select="applyTemplate"
            />
        </div>
    </main>
</template>
