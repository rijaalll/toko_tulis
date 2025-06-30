<template>
  <!-- Sidebar untuk Desktop -->
  <Sidebar class="d-none d-md-flex" />

  <!-- Konten Utama -->
  <div class="main-content">
    <router-view />
  </div>

  <!-- Bottom Nav untuk Mobile -->
  <BottomNav class="d-md-none" />
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import BottomNav from './components/BottomNav.vue';
</script>

<style scoped>
/* Scoped styles jika diperlukan */
</style>