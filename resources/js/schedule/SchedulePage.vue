<script setup lang="ts">
import SelectionBar from '@/kit/SelectionBar.vue';
import TemplateCard from '@/kit/TemplateCard.vue';
import UiButton from '@/kit/UiButton.vue';
import UiSearch from '@/kit/UiSearch.vue';
import AppSidebar from '@/schedule/AppSidebar.vue';
import CustomShiftPanel from '@/schedule/CustomShiftPanel.vue';
import { hoursLabel, templateTone } from '@/schedule/shiftPresentation';
import TemplateMenu from '@/schedule/TemplateMenu.vue';
import WeekGrid from '@/schedule/WeekGrid.vue';
import { useScheduleStore } from '@/stores/schedule';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

const store = useScheduleStore();
const { query, view, loading, error, employees, templates, selectionStats, selectionTemplateOpen, selectedCells } = storeToRefs(store);
const start = ref('09:00');
const end = ref('17:00');
const notice = ref('');
const saving = ref(false);
const navOpen = ref(false);
const menuPosition = ref({ top: 0, left: 0 });
const panel = useTemplateRef('panel');
const menuPanel = useTemplateRef('menuPanel');
const wideQuery = window.matchMedia('(min-width: 1100px)');

const sameTime = computed(() => start.value !== '' && start.value.slice(0, 5) === end.value.slice(0, 5));
const canApply = computed(() => selectionStats.value.cells > 0 && clock(start.value) !== null && clock(end.value) !== null && !sameTime.value);

const templateCards = computed(() =>
    templates.value.map((template, index) => {
        const tone = templateTone(template.name);

        return {
            id: template.id,
            name: template.name,
            range: `${template.start_time.slice(0, 5)} - ${template.end_time.slice(0, 5)}`,
            hours: hoursLabel(template.start_time, template.end_time),
            count: { Утро: 1, День: 2, Вечер: 4 }[template.name] ?? index + 1,
            tone: tone === 'solid' ? 'day' : tone,
        };
    }),
);

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
    if (saving.value) {
        return;
    }

    if (selectedCells.value.length === 0) {
        notice.value = 'Выделите ячейки, затем выберите шаблон';

        return;
    }

    saving.value = true;
    const saved = await store.assignTemplate(templateId, selectedCells.value);
    saving.value = false;

    if (saved) {
        selectionTemplateOpen.value = false;
    }
}

function confirmSaved(): void {
    notice.value = 'График уже сохранён на сервере';
}

async function removeSelected(): Promise<void> {
    if (saving.value) {
        return;
    }

    saving.value = true;
    await store.removeSelectedShifts();
    saving.value = false;
}

function syncScrollLock(): void {
    document.body.style.overflow = navOpen.value && !wideQuery.matches ? 'hidden' : '';
}

function onWideChange(): void {
    if (wideQuery.matches) {
        navOpen.value = false;
    }

    syncScrollLock();
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

watch(navOpen, syncScrollLock);

onMounted(() => {
    void store.load();
    document.addEventListener('pointerdown', onPointerDown);
    wideQuery.addEventListener('change', onWideChange);
});

onUnmounted(() => {
    document.removeEventListener('pointerdown', onPointerDown);
    wideQuery.removeEventListener('change', onWideChange);
    document.body.style.overflow = '';
});
</script>

<template>
    <div class="flex min-h-dvh overflow-x-hidden bg-canvas text-ink">
        <AppSidebar v-model:open="navOpen" />
        <main class="min-w-0 flex-1 overflow-x-hidden px-3 py-4 md:px-5 md:py-5 wide:px-6">
            <div class="flex items-center gap-2">
                <button
                    type="button"
                    class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-ink wide:hidden"
                    aria-label="Открыть меню"
                    @click="navOpen = true"
                >
                    <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M3.5 5h13M3.5 10h13M3.5 15h13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </button>
                <p class="flex items-center gap-2 text-sm text-muted">
                    <span class="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                        <svg class="size-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 3.5 5.5 8 10 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                    Графики смен
                </p>
            </div>
            <div class="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h1 class="text-2xl leading-none font-semibold tracking-tight md:text-[32px]">График</h1>
                <div class="grid grid-cols-2 gap-2 md:flex">
                    <UiButton class="w-full md:w-auto" tone="blue" variant="secondary" @click="confirmSaved">Опубликовать</UiButton>
                    <UiButton class="w-full md:w-auto" tone="blue" @click="confirmSaved">Сохранить</UiButton>
                </div>
            </div>
            <p v-if="notice" class="mt-2 text-sm text-muted" role="status">{{ notice }}</p>

            <div class="mt-4 flex flex-col items-stretch gap-3 md:gap-4 wide:flex-row wide:items-start">
                <section class="min-w-0 flex-1 overflow-hidden rounded-3xl bg-white p-3 md:p-4">
                    <header class="flex flex-col gap-2 pb-3 md:flex-row md:items-center md:pb-4">
                        <UiSearch v-model="query" class="w-full md:min-w-0 md:flex-1 wide:max-w-[400px] wide:flex-none" theme="gray" />
                        <div class="flex h-12 w-full shrink-0 items-center rounded-2xl bg-field p-0.5 md:w-[300px]" role="group" aria-label="Вид графика">
                            <button
                                type="button"
                                class="h-11 flex-1 rounded-xl text-sm font-medium"
                                :class="view === 'month' ? 'bg-[#3c3c43] text-white' : 'text-ink'"
                                :aria-pressed="view === 'month'"
                                @click="store.setView('month')"
                            >
                                Месяц
                            </button>
                            <button
                                type="button"
                                class="h-11 flex-1 rounded-xl text-sm font-medium"
                                :class="view === 'week' ? 'bg-[#3c3c43] text-white' : 'text-ink'"
                                :aria-pressed="view === 'week'"
                                @click="store.setView('week')"
                            >
                                Неделя
                            </button>
                        </div>
                    </header>

                    <p v-if="loading" class="py-6 text-sm text-muted" role="status">Загрузка графика…</p>

                    <template v-else>
                        <div v-if="error" class="flex flex-wrap items-center gap-3 py-3" role="alert">
                            <p class="text-sm text-ink">{{ error }}</p>
                            <UiButton variant="secondary" @click="store.load()">Повторить</UiButton>
                        </div>
                        <template v-if="employees.length > 0">
                            <div v-if="selectionStats.cells > 0" class="pb-3">
                                <SelectionBar
                                    :cells="selectionStats.cells"
                                    :employees="selectionStats.employees"
                                    :days="selectionStats.days"
                                    @apply="openTemplateMenu"
                                    @edit="editSelection"
                                    @clear="removeSelected"
                                    @remove="store.clearSelection()"
                                />
                            </div>
                            <WeekGrid />
                        </template>
                        <p v-else-if="!error" class="py-6 text-sm text-muted">В графике пока нет сотрудников.</p>
                    </template>
                </section>

                <aside class="w-full shrink-0 rounded-3xl bg-white p-3 md:p-4 wide:w-[300px]">
                    <div class="grid grid-cols-1 gap-6 md:max-wide:grid-cols-2 wide:gap-0">
                        <div>
                            <h2 class="text-sm font-semibold">Шаблоны смен</h2>
                            <div class="mt-3 flex flex-col gap-2">
                        <TemplateCard
                            v-for="template in templateCards"
                            :key="template.id"
                            :name="template.name"
                            :range="template.range"
                            :hours="template.hours"
                            :count="template.count"
                            :tone="template.tone"
                            interactive
                            fluid
                            :active="activeTemplateId === template.id"
                            :disabled="saving"
                            @click="applyTemplate(template.id)"
                        />
                        <p v-if="!loading && templateCards.length === 0" class="text-sm text-muted">Шаблонов нет.</p>
                            </div>
                        </div>
                        <CustomShiftPanel
                            ref="panel"
                            class="wide:mt-6"
                            v-model:start="start"
                            v-model:end="end"
                            :saving="saving"
                            :can-apply="canApply"
                            :same-time="sameTime"
                            @apply="applyCustom"
                            @arm="armSelection"
                        />
                    </div>
                </aside>
            </div>
        </main>
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
    </div>
</template>
