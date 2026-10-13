<template>
  <header class="topbar">
    <div>
      <p class="eyebrow">Simple Car Rental System</p>
      <h1>{{ currentTitle }}</h1>
    </div>
    <div class="topbar-date">{{ today }}</div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTitle = computed(() => route.name || 'Dashboard')
const today = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())
</script>
