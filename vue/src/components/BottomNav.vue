<template>
  <nav class="bottom-nav d-md-none">
    <div class="d-flex justify-content-around w-100">
      <router-link to="/transaksi" class="nav-link p-3" active-class="active">
        <i class="bi bi-cart-plus fs-4"></i>
        <span>Transaksi</span>
      </router-link>
      <router-link to="/produk" class="nav-link p-3" active-class="active">
        <i class="bi bi-box-seam fs-4"></i>
        <span>Produk</span>
      </router-link>
      <router-link to="/transaksi/riwayat" class="nav-link p-3" active-class="active">
        <i class="bi bi-clock-history fs-4"></i>
        <span>Riwayat</span>
      </router-link>
      <router-link to="/laporan" class="nav-link p-3" active-class="active">
        <i class="bi bi-bar-chart-line fs-4"></i>
        <span>Laporan</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
// Komponen ini tidak memerlukan script khusus
</script>

<style scoped>
.nav-link.router-link-exact-active {
  color: #0d6efd;
}
</style>

