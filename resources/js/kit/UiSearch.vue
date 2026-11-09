<script setup lang="ts">
withDefaults(
    defineProps<{
        theme?: 'gray' | 'white';
        placeholder?: string;
    }>(),
    {
        theme: 'gray',
        placeholder: 'Поиск по ФИО',
    },
);

const query = defineModel<string>({ default: '' });
</script>

<template>
    <label
        class="flex h-12 w-full items-center gap-2 rounded-2xl px-4 text-sm text-ink transition"
        :class="
            theme === 'gray'
                ? 'bg-field hover:bg-[#e8e9ef] focus-within:bg-field focus-within:ring-2 focus-within:ring-blue/30'
                : 'border border-line bg-white hover:border-zinc-300 focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/20'
        "
    >
        <svg class="size-4 shrink-0 text-muted" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.25" stroke="currentColor" stroke-width="1.5" />
            <path d="M10.5 10.5 13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <input
            v-model="query"
            type="text"
            :placeholder="placeholder"
            class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
        />
        <button
            v-if="query"
            type="button"
            class="text-muted hover:text-ink"
            aria-label="Очистить поиск"
            @click="query = ''"
        >
            <svg class="size-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2 2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
        </button>
    </label>
</template>
