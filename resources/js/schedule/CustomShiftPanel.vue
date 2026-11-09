<script setup lang="ts">
import UiButton from '@/kit/UiButton.vue';
import { useTemplateRef } from 'vue';

defineProps<{
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
    <form @submit.prevent="emit('apply')" @focusin="emit('arm')" @pointerdown="emit('arm')">
        <p class="text-sm font-semibold">Своя смена</p>
        <div class="mt-3 grid grid-cols-2 gap-3">
            <label class="text-xs text-muted">
                Начало
                <input
                    ref="startInput"
                    v-model="start"
                    type="time"
                    required
                    class="mt-1 block h-11 w-full rounded-xl bg-field px-2 py-2 text-center text-sm text-ink focus:ring-2 focus:ring-blue/30 focus:outline-none"
                />
            </label>
            <label class="text-xs text-muted">
                Конец
                <input
                    v-model="end"
                    type="time"
                    required
                    class="mt-1 block h-11 w-full rounded-xl bg-field px-2 py-2 text-center text-sm text-ink focus:ring-2 focus:ring-blue/30 focus:outline-none"
                />
            </label>
        </div>
        <UiButton class="mt-3 !h-11 w-full !rounded-xl" type="submit" tone="blue" variant="secondary" :disabled="!canApply || saving">+ Поставить в выделенные</UiButton>
        <p v-if="sameTime" class="mt-2 text-xs text-muted">Начало и конец должны различаться.</p>
    </form>
</template>
