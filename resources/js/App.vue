<script setup lang="ts">
import { computed } from 'vue';
import KitPage from './kit/KitPage.vue';
import SchedulePage from './schedule/SchedulePage.vue';

const showKit = computed(() => new URLSearchParams(window.location.search).has('kit'));
</script>

<template>
    <KitPage v-if="showKit" />
    <SchedulePage v-else />
</template>
