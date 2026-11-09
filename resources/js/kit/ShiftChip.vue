<script setup lang="ts">
withDefaults(
    defineProps<{
        view?: 'week' | 'month';
        time?: string;
        hours?: string;
        tone?: 'morning' | 'day' | 'evening' | 'solid';
        compact?: boolean;
    }>(),
    {
        view: 'week',
        time: '08 - 18',
        hours: '10 ч',
        tone: 'morning',
        compact: false,
    },
);

const tones = {
    morning: 'bg-shift-morning text-[#3d4f8f]',
    day: 'bg-shift-day text-[#1f6b56]',
    evening: 'bg-shift-evening text-[#5b458c]',
    solid: 'bg-shift-solid text-white',
};
</script>

<template>
    <span
        class="flex flex-col items-center justify-center text-center leading-tight"
        :class="[tones[tone], compact ? 'h-8 w-full rounded-lg px-0.5' : 'h-14 w-14 rounded-xl']"
    >
        <span v-if="view === 'week'" class="text-[13px] font-semibold">{{ time }}</span>
        <span :class="compact ? 'text-[11px] font-semibold' : view === 'week' ? 'text-[11px] opacity-80' : 'text-[13px] font-semibold'">{{ hours }}</span>
    </span>
</template>
