// tampilan sidebar untuk navigasi Desktop

<template>
  <div class="sidebar d-flex flex-column flex-shrink-0 p-3 text-white bg-dark">
    <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
      <i class="bi bi-shop-window fs-4 me-2"></i>
      <span class="fs-4">Toko Alat Tulis</span>
    </a>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <router-link to="/transaksi" class="nav-link" active-class="active">
          <i class="bi bi-cart-plus"></i>
          Transaksi
        </router-link>
      </li>
      <li>
        <router-link to="/produk" class="nav-link" active-class="active">
          <i class="bi bi-box-seam"></i>
          Produk
        </router-link>
      </li>
      <li>
        <router-link to="/transaksi/riwayat" class="nav-link" active-class="active">
          <i class="bi bi-clock-history"></i>
          Riwayat
        </router-link>
      </li>
      <li>
        <router-link to="/laporan" class="nav-link" active-class="active">
          <i class="bi bi-bar-chart-line"></i>
          Laporan
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav-pills .nav-link.router-link-exact-active {
  background-color: #0d6efd;
}
.sidebar {
  height: 100dvh;
  position: fixed;
}
</style>

