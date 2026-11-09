<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        name?: string;
        position?: string;
        hours?: string;
        avatarUrl?: string | null;
    }>(),
    {
        name: 'Сергеев Олег',
        position: 'агент',
        hours: '24 ч',
        avatarUrl: null,
    },
);

const initials = computed(() =>
    props.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase(),
);
</script>

<template>
    <div class="flex min-w-0 items-center gap-2 md:gap-3">
        <img v-if="avatarUrl" :src="avatarUrl" alt="" class="size-8 rounded-[10px] object-cover md:size-10" />
        <span v-else class="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-blue text-[11px] font-semibold text-white md:size-10 md:text-[13px]">
            {{ initials }}
        </span>
        <span class="min-w-0">
            <span class="block truncate text-[13px] font-medium text-ink md:text-sm">{{ name }}</span>
            <span class="block truncate text-[11px] text-muted md:text-xs">{{ position }} · {{ hours }}</span>
        </span>
    </div>
</template>
