<script setup lang="ts">
withDefaults(
    defineProps<{
        view?: 'week' | 'month';
        time?: string;
        hours?: string;
        tone?: 'morning' | 'day' | 'evening' | 'solid';
        compact?: boolean;
        fluid?: boolean;
    }>(),
    {
        view: 'week',
        time: '08 - 18',
        hours: '10 ч',
        tone: 'morning',
        compact: false,
        fluid: false,
    },
);

const tones = {
    morning: 'bg-shift-morning text-[#4454a8]',
    day: 'bg-shift-day text-[#6d45b8]',
    evening: 'bg-shift-evening text-[#1f7d7a]',
    solid: 'bg-shift-solid text-white',
};
</script>

<template>
    <span
        class="flex flex-col items-center justify-center text-center leading-tight"
        :class="[tones[tone], compact ? 'h-7 w-full rounded-lg px-0.5 md:h-8' : fluid ? 'h-12 w-full rounded-xl px-0.5 md:h-14 md:px-1' : 'h-14 w-14 rounded-xl']"
    >
        <span v-if="view === 'week'" class="text-[11px] font-semibold whitespace-nowrap md:text-[13px]">{{ time }}</span>
        <span :class="compact ? 'text-[11px] font-semibold' : view === 'week' ? 'text-[11px] opacity-80' : 'text-[13px] font-semibold'">{{ hours }}</span>
    </span>
</template>
