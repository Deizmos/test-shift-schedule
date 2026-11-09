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
    <div class="flex items-center gap-3">
        <img v-if="avatarUrl" :src="avatarUrl" alt="" class="size-10 rounded-[10px] object-cover" />
        <span v-else class="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-blue text-[13px] font-semibold text-white">
            {{ initials }}
        </span>
        <span class="min-w-0">
            <span class="block truncate text-sm font-semibold text-ink">{{ name }}</span>
            <span class="block truncate text-xs text-muted">{{ position }} · {{ hours }}</span>
        </span>
    </div>
</template>
