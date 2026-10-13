<template>
  <aside class="sidebar">
    <RouterLink class="brand" to="/">
      <span class="brand-mark">CR</span>
      <span>
        <strong>Car Rental</strong>
        <small>College Project</small>
      </span>
    </RouterLink>

    <nav class="nav-links" aria-label="Main navigation">
      <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path">
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
const menuItems = [
  { path: '/', label: 'Dashboard', icon: 'D' },
  { path: '/cars', label: 'Cars', icon: 'C' },
  { path: '/customers', label: 'Customers', icon: 'U' },
  { path: '/rentals', label: 'Rentals', icon: 'R' },
]
</script>
