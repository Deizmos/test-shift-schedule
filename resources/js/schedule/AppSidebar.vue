<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

const open = defineModel<boolean>('open', { default: false });

const collapsed = ref(false);
const closeButton = useTemplateRef('closeButton');
const wideQuery = window.matchMedia('(max-width: 1099px)');
const belowWide = ref(wideQuery.matches);

function toggle(): void {
    collapsed.value = !collapsed.value;
}

function syncBelowWide(): void {
    belowWide.value = wideQuery.matches;

    if (!belowWide.value) {
        open.value = false;
    }
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !open.value || !belowWide.value) {
        return;
    }

    open.value = false;
    event.preventDefault();
    event.stopImmediatePropagation();
}

watch(open, (value) => {
    if (!value) {
        return;
    }

    requestAnimationFrame(() => closeButton.value?.focus());
});

onMounted(() => {
    syncBelowWide();
    wideQuery.addEventListener('change', syncBelowWide);
    window.addEventListener('keydown', onKeydown, true);
});

onUnmounted(() => {
    wideQuery.removeEventListener('change', syncBelowWide);
    window.removeEventListener('keydown', onKeydown, true);
});
</script>

<template>
    <div v-if="open" class="fixed inset-0 z-40 bg-ink/40 wide:hidden" @click="open = false" />
    <aside
        class="flex h-dvh shrink-0 flex-col bg-canvas px-3 py-4 text-ink max-wide:fixed max-wide:inset-y-0 max-wide:left-0 max-wide:z-50 max-wide:w-60 max-wide:transition-transform max-wide:duration-200 wide:sticky wide:top-0 wide:z-20"
        :class="[open ? 'max-wide:translate-x-0' : 'max-wide:-translate-x-full', collapsed ? 'wide:w-[72px]' : 'wide:w-60']"
        :inert="belowWide && !open"
    >
        <div class="flex items-center gap-2 px-2" :class="collapsed ? 'wide:justify-center' : 'justify-between'">
            <p class="text-base font-semibold tracking-tight" :class="collapsed ? 'wide:sr-only' : ''">CRM</p>
            <div class="flex items-center gap-1">
            <button
                ref="closeButton"
                type="button"
                class="inline-flex size-8 items-center justify-center rounded-lg text-muted wide:hidden"
                aria-label="Закрыть меню"
                @click="open = false"
            >
                <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            </button>
            <span class="text-muted" aria-hidden="true">
                <svg class="size-5" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3.2a4.2 4.2 0 0 0-4.2 4.2c0 2.4-.7 3.6-1.3 4.4-.3.4 0 1 .5 1h10c.5 0 .8-.6.5-1-.6-.8-1.3-2-1.3-4.4A4.2 4.2 0 0 0 10 3.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    <path d="M8.4 14.8a1.6 1.6 0 0 0 3.2 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            </span>
            </div>
        </div>

        <nav class="mt-6 flex flex-col gap-1" aria-label="Разделы">
            <button type="button" class="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted" :class="collapsed ? 'wide:justify-center wide:px-0' : ''" :title="collapsed ? 'Главная' : undefined">
                <svg class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 9.2 10 4l6 5.2V16a1 1 0 0 1-1 1h-3.2v-4.2H8.2V17H5a1 1 0 0 1-1-1V9.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
                <span :class="collapsed ? 'wide:sr-only' : ''">Главная</span>
            </button>
            <button
                type="button"
                class="flex h-10 items-center gap-3 rounded-xl bg-white px-3 text-sm font-medium text-ink"
                :class="collapsed ? 'wide:justify-center wide:px-0' : ''"
                aria-current="page"
                :title="collapsed ? 'Смены' : undefined"
            >
                <svg class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <rect x="3.5" y="4.5" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.5" />
                    <path d="M3.5 8h13M7 3.5v2.5M13 3.5v2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <span :class="collapsed ? 'wide:sr-only' : ''">Смены</span>
            </button>
        </nav>

        <button
            type="button"
            class="mt-auto hidden h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-white/70 hover:text-ink wide:flex"
            :class="collapsed ? 'justify-center px-0' : ''"
            :aria-expanded="!collapsed"
            :aria-label="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
            @click="toggle"
        >
            <svg class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="3.5" y="4" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 4v12" stroke="currentColor" stroke-width="1.5" />
            </svg>
            <span :class="collapsed ? 'sr-only' : ''">Свернуть меню</span>
        </button>
    </aside>
</template>
