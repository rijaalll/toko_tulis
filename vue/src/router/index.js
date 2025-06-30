import { createRouter, createWebHistory } from 'vue-router'
import Produk from '../views/Produk.vue'
import Transaksi from '../views/Transaksi.vue'
import RiwayatTransaksi from '../views/RiwayatTransaksi.vue'
import Laporan from '../views/Laporan.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      // push ke halaman transaksi secara default
      redirect: '/transaksi'
    },
    {
      path: '/produk',
      name: 'produk',
      component: Produk
    },
    {
      path: '/transaksi',
      name: 'transaksi',
      component: Transaksi
    },
    {
      path: '/transaksi/riwayat',
      name: 'riwayat-transaksi',
      component: RiwayatTransaksi
    },
    {
      path: '/laporan',
      name: 'laporan',
      component: Laporan
    }
  ],
  
  // Menambahkan kelas aktif untuk link
  linkActiveClass: 'active-link'
})

export default router
