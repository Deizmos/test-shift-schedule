<script setup lang="ts">
withDefaults(
    defineProps<{
        cells?: number;
        employees?: number;
        days?: number;
    }>(),
    {
        cells: 6,
        employees: 2,
        days: 4,
    },
);

const emit = defineEmits<{
    apply: [event: MouseEvent];
    edit: [];
    clear: [];
    remove: [];
}>();
</script>

<template>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-ink px-3 py-2 text-[13px] text-white">
        <p class="flex flex-wrap items-center gap-2">
            <span>Выделено:</span>
            <span class="rounded-md bg-white/15 px-2 py-0.5">{{ cells }} ячеек</span>
            <span class="text-white/70">{{ employees }} сотрудника(-ов) · {{ days }} дн.</span>
        </p>
        <div class="ml-auto flex flex-wrap items-center gap-1">
            <button type="button" data-selection-apply class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white/10" @click="emit('apply', $event)">
                <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                </svg>
                Применить шаблон
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white/10" @click="emit('edit')">
                <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M9.5 3.5 12.5 6.5 5 14H2v-3L9.5 3.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                </svg>
                Изменить
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white/10" @click="emit('clear')">
                <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8a5 5 0 1 0 1.2-3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    <path d="M3 3.5V6h2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Очистить
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white/10" @click="emit('remove')">
                <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4l8 8M12 4 4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
                Снять
            </button>
        </div>
    </div>
</template>
