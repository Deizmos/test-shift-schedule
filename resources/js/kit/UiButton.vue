<script setup lang="ts">
import { computed } from 'vue';

type Tone = 'ink' | 'blue';
type Variant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary';

const props = withDefaults(
    defineProps<{
        tone?: Tone;
        variant?: Variant;
        disabled?: boolean;
        active?: boolean;
        icon?: boolean;
        type?: 'button' | 'submit';
    }>(),
    {
        tone: 'ink',
        variant: 'primary',
        type: 'button',
    },
);

const styles: Record<Tone, Record<Variant, string>> = {
    ink: {
        primary: 'bg-ink text-white hover:bg-[#2a2b31] active:bg-[#2a2b31] data-[selected=true]:bg-black',
        secondary: 'bg-zinc-100 text-ink hover:bg-zinc-200 active:bg-zinc-200 data-[selected=true]:bg-zinc-300',
        tertiary: 'border border-line bg-white text-ink hover:bg-zinc-50 active:bg-zinc-50 data-[selected=true]:bg-zinc-200',
        quaternary: 'bg-transparent text-ink hover:bg-zinc-100 active:bg-zinc-100 data-[selected=true]:bg-zinc-200',
        quinary: 'bg-white text-ink shadow-sm hover:bg-zinc-50 active:bg-zinc-50 data-[selected=true]:bg-zinc-200',
    },
    blue: {
        primary: 'bg-blue text-white hover:bg-[#516bd4] active:bg-[#516bd4] data-[selected=true]:bg-[#4059c4]',
        secondary: 'bg-blue-soft text-blue hover:bg-[#dde3f8] active:bg-[#dde3f8] data-[selected=true]:bg-[#d1d9f6]',
        tertiary: 'border border-blue/30 bg-white text-blue hover:bg-blue-soft active:bg-blue-soft data-[selected=true]:bg-[#dde3f8]',
        quaternary: 'bg-transparent text-blue hover:bg-blue-soft active:bg-blue-soft data-[selected=true]:bg-[#d9e2ff]',
        quinary: 'bg-white text-blue shadow-sm hover:bg-blue-soft active:bg-blue-soft data-[selected=true]:bg-[#d9e2ff]',
    },
};

const shape = computed(() => {
    if (props.variant === 'quinary') {
        return 'h-11 rounded-xl px-5';
    }

    if (props.icon) {
        return 'size-8 rounded-lg px-0';
    }

    return 'h-8 rounded-lg px-3';
});
</script>

<template>
    <button
        :type="type"
        :disabled="disabled"
        :data-selected="active ? 'true' : undefined"
        :aria-pressed="active ? 'true' : undefined"
        class="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium transition disabled:pointer-events-none disabled:opacity-40"
        :class="[shape, styles[tone][variant]]"
    >
        <slot />
    </button>
</template>
