<template>
  <article class="stat-card" :class="accentClass">
    <p>{{ title }}</p>
    <strong>{{ value }}</strong>
    <span>{{ note }}</span>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  accent: {
    type: String,
    default: 'blue',
  },
})

const accentClass = computed(() => `stat-${props.accent}`)
</script>
