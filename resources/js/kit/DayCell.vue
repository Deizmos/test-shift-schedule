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
                ? [view === 'month' ? 'h-11 w-full px-0.5' : 'h-16 w-full', selected ? 'bg-[#eef1ff] text-blue ring-2 ring-blue/40 ring-inset' : 'bg-transparent hover:bg-zinc-50']
                : [
                      'h-[72px] w-[72px] rounded-xl',
                      state === 'empty' ? 'border border-dashed border-zinc-300 bg-white' : '',
                      state === 'selected' ? 'border border-blue/40 bg-[#eef1ff] text-blue' : '',
                      state === 'filled' ? 'border border-transparent bg-transparent' : '',
                  ]
        "
    >
        <span v-if="state === 'selected' || (surface === 'grid' && selected && state === 'empty')" class="text-lg leading-none">+</span>
        <ShiftChip v-else-if="state === 'filled'" :view="view" :compact="surface === 'grid' && view === 'month'" :time="time" :hours="hours" :tone="tone" />
    </button>
</template>
