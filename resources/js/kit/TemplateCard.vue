<script setup lang="ts">
withDefaults(
    defineProps<{
        name?: string;
        range?: string;
        hours?: string;
        count?: number;
        tone?: 'morning' | 'day' | 'evening';
    }>(),
    {
        name: 'Название',
        range: '07:00 - 15:00',
        hours: '8 ч',
        count: 1,
        tone: 'morning',
    },
);

const edge = {
    morning: 'bg-shift-morning',
    day: 'bg-shift-day',
    evening: 'bg-shift-evening',
};
</script>

<template>
    <article class="flex w-56 items-stretch overflow-hidden rounded-2xl bg-zinc-100">
        <span class="w-1.5 shrink-0" :class="edge[tone]" />
        <div class="flex flex-1 items-start justify-between gap-3 px-3 py-2.5">
            <div>
                <p class="text-sm font-semibold text-ink">{{ name }}</p>
                <p class="text-xs text-muted">{{ range }} · {{ hours }}</p>
            </div>
            <span class="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink">{{ count }}</span>
        </div>
    </article>
</template>
