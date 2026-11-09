<script setup lang="ts">
import UiButton from '@/kit/UiButton.vue';
import { useTemplateRef } from 'vue';

defineProps<{
    count: number;
    saving: boolean;
    canApply: boolean;
    sameTime: boolean;
}>();

const start = defineModel<string>('start', { required: true });
const end = defineModel<string>('end', { required: true });

const emit = defineEmits<{
    apply: [];
    arm: [];
}>();

const startInput = useTemplateRef('startInput');

function focusStart(): void {
    startInput.value?.focus();
}

defineExpose({ focusStart });
</script>

<template>
    <form class="flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-line px-4 py-3" @submit.prevent="emit('apply')" @focusin="emit('arm')" @pointerdown="emit('arm')">
        <div class="mr-auto min-w-56">
            <p class="text-sm font-semibold">Своя смена</p>
            <p class="mt-0.5 max-w-md text-xs text-muted">
                <template v-if="count > 0">Время запишется во все выделенные ячейки. Повторное назначение заменяет смену.</template>
                <template v-else>Кликните поле времени и выберите ячейки. Shift+клик и протягивание мышью выделяют сразу, Escape снимает выделение. Смену можно перетащить в другую ячейку.</template>
            </p>
        </div>
        <label class="text-xs text-muted">
            Начало
            <input
                ref="startInput"
                v-model="start"
                type="time"
                required
                class="mt-1 block rounded-lg border border-line bg-white px-2 py-1 text-sm text-ink focus:border-blue focus:ring-2 focus:ring-blue/20 focus:outline-none"
            />
        </label>
        <label class="text-xs text-muted">
            Конец
            <input v-model="end" type="time" required class="mt-1 block rounded-lg border border-line bg-white px-2 py-1 text-sm text-ink focus:border-blue focus:ring-2 focus:ring-blue/20 focus:outline-none" />
        </label>
        <UiButton type="submit" tone="blue" variant="secondary" :disabled="!canApply || saving">+ Поставить в выделенные</UiButton>
        <p v-if="sameTime" class="basis-full text-xs text-muted">Начало и конец должны различаться.</p>
    </form>
</template>
