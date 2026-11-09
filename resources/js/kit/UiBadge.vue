<script setup lang="ts">
withDefaults(
    defineProps<{
        tone?: 'blue' | 'ink';
    }>(),
    { tone: 'blue' },
);
</script>

<template>
    <span
        class="inline-flex h-7 items-center rounded-full px-3 text-[13px] font-medium text-white"
        :class="tone === 'blue' ? 'bg-blue' : 'bg-ink'"
    >
        <slot />
    </span>
</template>
