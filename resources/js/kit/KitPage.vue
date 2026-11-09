<script setup lang="ts">
import { ref } from 'vue';
import DayCell from './DayCell.vue';
import EmployeeCell from './EmployeeCell.vue';
import SelectionBar from './SelectionBar.vue';
import ShiftChip from './ShiftChip.vue';
import TemplateCard from './TemplateCard.vue';
import UiBadge from './UiBadge.vue';
import UiButton from './UiButton.vue';
import UiSearch from './UiSearch.vue';

const grayQuery = ref('');
const whiteQuery = ref('Пишем что-то');
const tones = ['morning', 'day', 'evening', 'solid'] as const;
</script>

<template>
    <main class="min-h-screen bg-canvas px-6 py-8 text-ink">
        <h1 class="text-2xl font-semibold">UI kit</h1>
        <p class="mt-1 text-sm text-muted">Компоненты из верхней части макета графика смен.</p>

        <section class="mt-8">
            <h2 class="text-sm font-medium text-blue">Кнопки</h2>
            <div class="mt-4 flex flex-wrap items-center gap-3">
                <UiButton>Копия</UiButton>
                <UiButton>
                    Текст длинный
                    <span aria-hidden="true">×</span>
                </UiButton>
                <UiButton tone="blue">Сохранить</UiButton>
                <UiButton tone="blue" variant="secondary">Опубликовать</UiButton>
                <UiButton variant="tertiary">Tertiary</UiButton>
                <UiButton variant="quaternary">Quaternary</UiButton>
                <UiButton variant="quinary">9</UiButton>
                <UiButton disabled>Disable</UiButton>
                <UiButton active>Active</UiButton>
                <UiButton tone="blue" active>Active</UiButton>
            </div>
        </section>

        <section class="mt-8">
            <h2 class="text-sm font-medium text-blue">Badge</h2>
            <div class="mt-4 flex gap-3">
                <UiBadge>Badge</UiBadge>
                <UiBadge tone="ink">Badge</UiBadge>
            </div>
        </section>

        <section class="mt-8">
            <h2 class="text-sm font-medium text-blue">Ячейки таблицы</h2>
            <div class="mt-4 grid grid-cols-2 gap-6">
                <div>
                    <p class="mb-3 text-sm font-medium">Неделя</p>
                    <div class="flex gap-3">
                        <DayCell />
                        <DayCell state="selected" />
                        <DayCell state="filled" />
                    </div>
                </div>
                <div>
                    <p class="mb-3 text-sm font-medium">Месяц</p>
                    <div class="flex gap-3">
                        <DayCell view="month" />
                        <DayCell view="month" state="selected" />
                        <DayCell view="month" state="filled" />
                    </div>
                </div>
            </div>
        </section>

        <section class="mt-8">
            <h2 class="text-sm font-medium text-blue">Смена проставленная</h2>
            <div class="mt-4 flex flex-wrap gap-6">
                <div v-for="view in ['week', 'month']" :key="view">
                    <p class="mb-3 text-sm font-medium">{{ view === 'week' ? 'Неделя' : 'Месяц' }}</p>
                    <div class="flex flex-col gap-2">
                        <ShiftChip v-for="tone in tones" :key="tone" :view="view === 'week' ? 'week' : 'month'" :tone="tone" />
                    </div>
                </div>
                <div>
                    <p class="mb-3 text-sm font-medium">Шаблоны смен</p>
                    <div class="flex flex-col gap-2">
                        <TemplateCard name="Утро" range="07:00 - 15:00" :count="1" tone="morning" />
                        <TemplateCard name="День" range="10:00 - 18:00" :count="2" tone="day" />
                        <TemplateCard name="Вечер" range="15:00 - 23:00" :count="4" tone="evening" />
                    </div>
                </div>
            </div>
        </section>

        <section class="mt-8">
            <h2 class="text-sm font-medium text-blue">Ячейка сотрудника</h2>
            <div class="mt-4">
                <EmployeeCell />
            </div>
        </section>

        <section class="mt-8">
            <h2 class="text-sm font-medium text-blue">Быстрые действия с информацией</h2>
            <div class="mt-4 max-w-4xl">
                <SelectionBar />
            </div>
        </section>

        <section class="mt-8">
            <h2 class="text-sm font-medium text-blue">Поиск</h2>
            <div class="mt-4 grid gap-6 sm:grid-cols-2">
                <div>
                    <p class="mb-3 text-sm font-medium">Серые</p>
                    <UiSearch v-model="grayQuery" theme="gray" />
                </div>
                <div>
                    <p class="mb-3 text-sm font-medium">Белый</p>
                    <UiSearch v-model="whiteQuery" theme="white" />
                </div>
            </div>
        </section>
    </main>
</template>
