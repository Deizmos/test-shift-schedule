<script setup lang="ts">
withDefaults(
    defineProps<{
        name?: string;
        range?: string;
        hours?: string;
        count?: number;
        tone?: 'morning' | 'day' | 'evening';
        interactive?: boolean;
        active?: boolean;
        disabled?: boolean;
        fluid?: boolean;
    }>(),
    {
        name: 'Название',
        range: '07:00 - 15:00',
        hours: '8 ч',
        count: 1,
        tone: 'morning',
        interactive: false,
        active: false,
        disabled: false,
        fluid: false,
    },
);

const edge = {
    morning: 'bg-shift-morning-edge',
    day: 'bg-shift-day-edge',
    evening: 'bg-shift-evening-edge',
};
</script>

<template>
    <component
        :is="interactive ? 'button' : 'article'"
        :type="interactive ? 'button' : undefined"
        :disabled="interactive ? disabled : undefined"
        class="flex items-stretch overflow-hidden rounded-xl bg-field text-left"
        :class="[
            fluid ? 'w-full' : 'w-56',
            interactive ? 'hover:bg-zinc-200/70 disabled:pointer-events-none disabled:opacity-40' : '',
            active ? 'ring-2 ring-blue' : '',
        ]"
    >
        <span class="w-2 shrink-0" :class="edge[tone]" />
        <div class="flex flex-1 items-start justify-between gap-3 px-3 py-2.5">
            <div>
                <p class="text-sm font-semibold text-ink">{{ name }}</p>
                <p class="text-xs text-muted">{{ range }} · {{ hours }}</p>
            </div>
            <span class="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink">{{ count }}</span>
        </div>
    </component>
</template>
