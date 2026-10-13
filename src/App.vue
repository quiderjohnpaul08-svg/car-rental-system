<template>
  <div class="app-shell">
    <Sidebar />
    <div class="main-area">
      <Navbar />
      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
</script>
