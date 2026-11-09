<script setup lang="ts">
import ShiftChip from './ShiftChip.vue';

withDefaults(
    defineProps<{
        view?: 'week' | 'month';
        state?: 'empty' | 'selected' | 'filled';
        time?: string;
        hours?: string;
        tone?: 'morning' | 'day' | 'evening' | 'solid';
        label?: string;
        surface?: 'kit' | 'grid';
        selected?: boolean;
    }>(),
    {
        view: 'week',
        state: 'empty',
        time: '08 - 18',
        hours: '10 ч',
        tone: 'morning',
        label: undefined,
        surface: 'kit',
        selected: false,
    },
);
</script>

<template>
    <button
        type="button"
        class="flex items-center justify-center"
        :aria-label="label"
        :class="
            surface === 'grid'
                ? [view === 'month' ? 'h-10 w-full px-0.5 md:h-12 md:px-1' : 'h-16 w-full px-1 md:h-[76px] md:px-2']
                : [
                      'h-[72px] w-[72px] rounded-xl',
                      state === 'empty' ? 'border border-dashed border-[#d5d8e2] bg-white' : '',
                      state === 'selected' ? 'border border-solid border-blue bg-blue-soft text-blue' : '',
                      state === 'filled' ? 'border border-transparent bg-transparent' : '',
                  ]
        "
    >
        <span
            v-if="surface === 'grid' && state !== 'filled'"
            class="flex w-full items-center justify-center rounded-xl border bg-white"
            :class="[
                view === 'month' ? 'h-7 md:h-8' : 'h-12 md:h-14',
                selected ? 'border-solid border-blue bg-blue-soft text-blue' : 'border-dashed border-[#d5d8e2]',
            ]"
        >
            <span
                v-if="selected"
                class="flex items-center justify-center rounded-full border border-blue"
                :class="view === 'month' ? 'size-4' : 'size-6'"
            >
                <svg :class="view === 'month' ? 'size-2.5' : 'size-3.5'" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
            </span>
        </span>
        <span v-else-if="state === 'selected'" class="flex size-6 items-center justify-center rounded-full border border-blue text-blue">
            <svg class="size-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
        </span>
        <ShiftChip
            v-else-if="state === 'filled'"
            :view="view"
            :compact="surface === 'grid' && view === 'month'"
            :fluid="surface === 'grid' && view === 'week'"
            :time="time"
            :hours="hours"
            :tone="tone"
            :class="surface === 'grid' && selected ? 'ring-2 ring-blue' : ''"
        />
    </button>
</template>
