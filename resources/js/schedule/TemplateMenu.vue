<script setup lang="ts">
import { hoursLabel, templateTone } from '@/schedule/shiftPresentation';
import type { ShiftTemplate, ShiftTone } from '@/types/schedule';
import { onMounted, useTemplateRef } from 'vue';

defineProps<{
    title: string;
    subtitle: string;
    templates: ShiftTemplate[];
    activeTemplateId: number | null;
    saving: boolean;
}>();

const emit = defineEmits<{
    select: [templateId: number];
}>();

const root = useTemplateRef('root');

const bars: Record<ShiftTone, string> = {
    morning: 'bg-shift-morning-edge',
    day: 'bg-shift-day-edge',
    evening: 'bg-shift-evening-edge',
    solid: 'bg-shift-solid',
};

onMounted(() => {
    root.value?.querySelector('button')?.focus();
});
</script>

<template>
    <div ref="root" class="w-[min(15rem,calc(100vw-1rem))] rounded-2xl bg-white p-2 shadow-lg ring-1 ring-line" role="menu" :aria-label="title" :aria-busy="saving">
        <p class="truncate px-2 pt-1 text-sm font-semibold text-ink">{{ title }}</p>
        <p class="px-2 pb-2 text-xs text-muted">{{ subtitle }}</p>
        <p v-if="templates.length === 0" class="px-2 py-2 text-sm text-muted">Шаблонов нет.</p>
        <div v-else class="flex flex-col gap-1">
            <button
                v-for="template in templates"
                :key="template.id"
                type="button"
                role="menuitemradio"
                class="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-zinc-50 disabled:opacity-60"
                :class="template.id === activeTemplateId ? 'bg-blue-soft' : 'bg-transparent'"
                :aria-checked="template.id === activeTemplateId"
                :disabled="saving"
                @click="emit('select', template.id)"
            >
                <span class="h-8 w-1.5 shrink-0 rounded-full" :class="bars[templateTone(template.name)]" />
                <span>
                    <span class="block text-sm font-semibold text-ink">{{ template.name }}</span>
                    <span class="block text-xs text-muted">{{ template.start_time }}–{{ template.end_time }} · {{ hoursLabel(template.start_time, template.end_time) }}</span>
                </span>
            </button>
        </div>
    </div>
</template>
