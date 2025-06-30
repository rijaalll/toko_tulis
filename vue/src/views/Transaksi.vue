<template>
  <div class="container-fluid">
    <!-- Tombol Scroll ke Keranjang (Hanya Mobile) -->
    <button @click="scrollToCart" class="btn btn-primary rounded-circle shadow-lg scroll-to-cart-btn d-lg-none">
      <i class="bi bi-cart3 fs-5"></i>
    </button>

    <h1 class="h3 mb-4 text-gray-800">Menu Transaksi</h1>

    <div class="row">
      <div class="col-lg-7 col-xl-8">
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Pilih Produk</h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <input type="text" class="form-control" placeholder="Cari produk berdasarkan nama..." v-model="searchQuery">
            </div>
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-else class="row g-3 product-grid">
              <div v-if="filteredAvailableProducts.length === 0 && filteredUnavailableProducts.length === 0" class="col-12 text-center text-muted pt-4">
                <h5>Produk tidak ditemukan</h5>
                <p>Coba kata kunci lain atau periksa daftar produk.</p>
              </div>

              <div class="col-6 col-md-4 col-lg-3" v-for="product in filteredAvailableProducts" :key="product.id">
                <div 
                  class="card h-100 card-product" 
                  @click="addToCart(product)" 
                  role="button"
                >
                  <img 
                    :src="product.image_url || 'https://placehold.co/150/e0e0e0/333?text=N/A'" 
                    class="card-img-top" 
                    :alt="product.nama"
                    @error="handleImageError"
                  >
                  <div class="card-body text-center p-2">
                    <h6 class="card-title fs-6 mb-1 text-truncate">{{ product.nama }}</h6>
                    <p class="card-text fw-bold text-success mb-1">{{ formatCurrency(product.harga) }}</p>
                    <p class="card-text">
                      <small class="text-muted">Stok: {{ product.stok }}</small>
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="filteredAvailableProducts.length > 0 && filteredUnavailableProducts.length > 0" class="col-12">
                <hr class="my-3">
                <h6 class="text-center text-muted mb-3">Stok Habis</h6>
              </div>

              <div class="col-6 col-md-4 col-lg-3" v-for="product in filteredUnavailableProducts" :key="product.id">
                <div 
                  class="card h-100 card-product out-of-stock" 
                  role="none"
                >
                  <div class="stock-overlay">
                    <span class="stock-text">Stok Habis</span>
                  </div>
                  <img 
                    :src="product.image_url || 'https://placehold.co/150/e0e0e0/333?text=N/A'" 
                    class="card-img-top" 
                    :alt="product.nama"
                    @error="handleImageError"
                  >
                  <div class="card-body text-center p-2">
                    <h6 class="card-title fs-6 mb-1 text-truncate">{{ product.nama }}</h6>
                    <p class="card-text fw-bold text-success mb-1">{{ formatCurrency(product.harga) }}</p>
                    <p class="card-text">
                      <small class="text-danger fw-bold">Stok: 0</small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-5 col-xl-4" ref="cartSection">
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Detail Pembelian</h6>
          </div>
          <div class="card-body cart-body">
            <div v-if="cart.length === 0" class="text-center text-muted py-5">
              <i class="bi bi-cart-x" style="font-size: 3rem;"></i>
              <p class="mt-2">Keranjang masih kosong</p>
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="item in cart" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div class="flex-grow-1 me-2">
                  <h6 class="my-0 text-truncate">{{ item.nama }}</h6>
                  <small class="text-muted">{{ formatCurrency(item.harga) }}</small>
                </div>
                <div class="d-flex align-items-center">
                  <button class="btn btn-sm btn-outline-secondary" @click="decreaseQuantity(item)">-</button>
                  <span class="mx-2 fw-bold">{{ item.jumlah }}</span>
                  <button class="btn btn-sm btn-outline-secondary" @click="increaseQuantity(item)">+</button>
                  <button class="btn btn-sm btn-danger ms-3" @click="removeFromCart(item.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-footer" v-if="cart.length > 0">
            <div class="mb-3">
              <label for="namaPembeli" class="form-label">Nama Pembeli (Opsional)</label>
              <input type="text" class="form-control" id="namaPembeli" v-model="namaPembeli" placeholder="Masukkan nama pembeli">
            </div>
            <div class="d-flex justify-content-between fw-bold fs-5 mb-3">
              <span>Total:</span>
              <span>{{ formatCurrency(totalPrice) }}</span>
            </div>
            <div class="d-grid">
              <button class="btn btn-success btn-lg" @click="processTransaction" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {{ isProcessing ? 'Memproses...' : 'Bayar Sekarang' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <CustomModal 
      :show="modalState.show"
      :title="modalState.title"
      :message="modalState.message"
      :status="modalState.status"
      @close="modalState.show = false"
      @confirm="modalState.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import ApiService from '../services/ApiService';
import { useRouter } from 'vue-router';
import CustomModal from '../components/CustomModal.vue';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const cart = ref([]);
const isProcessing = ref(false);
const router = useRouter();
const namaPembeli = ref('');
const cartSection = ref(null);

const modalState = reactive({
  show: false,
  title: '',
  message: '',
  status: 'primary',
});

const scrollToCart = () => {
  cartSection.value?.scrollIntoView({ behavior: 'smooth' });
};

const showCustomModal = (config) => {
  modalState.title = config.title;
  modalState.message = config.message;
  modalState.status = config.status || 'primary';
  modalState.show = true;
};

// Ambil data produk saat komponen dimuat
const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await ApiService.getProduk();
    products.value = response.data;
  } catch (err) {
    error.value = 'Gagal memuat data produk.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Filter produk yang tersedia dan tidak tersedia berdasarkan stok dan pencarian
const filteredAvailableProducts = computed(() => {
  return products.value
    .filter(product => product.stok > 0 && product.nama.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .sort((a, b) => a.nama.localeCompare(b.nama));
});

const filteredUnavailableProducts = computed(() => {
  return products.value
    .filter(product => product.stok === 0 && product.nama.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .sort((a, b) => a.nama.localeCompare(b.nama));
});

// Fungsi untuk menambahkan produk ke keranjang
const addToCart = (product) => {
  if (product.stok <= 0) {
    showCustomModal({ title: 'Stok Habis', message: 'Produk ini sudah habis.', status: 'warning' });
    return;
  }

  const existingItem = cart.value.find(item => item.id === product.id);
  if (existingItem) {
    if (existingItem.jumlah < product.stok) {
      existingItem.jumlah++;
    } else {
      showCustomModal({ title: 'Stok Habis', message: 'Stok produk tidak mencukupi.', status: 'danger' });
    }
  } else {
    cart.value.push({ ...product, jumlah: 1 });
  }
};

// Fungsi untuk menghapus produk dari keranjang
const removeFromCart = (productId) => {
  cart.value = cart.value.filter(item => item.id !== productId);
};

// Fungsi untuk meningkatkan atau mengurangi jumlah produk di keranjang
const increaseQuantity = (item) => {
  const productInStock = products.value.find(p => p.id === item.id);
  if (productInStock && item.jumlah < productInStock.stok) {
    item.jumlah++;
  } else {
    showCustomModal({ title: 'Stok Habis', message: 'Stok produk tidak mencukupi.', status: 'danger' });
  }
};

// Fungsi untuk mengurangi jumlah produk di keranjang
const decreaseQuantity = (item) => {
  if (item.jumlah > 1) {
    item.jumlah--;
  } else {
    removeFromCart(item.id);
  }
};

// Hitung total harga dari semua item di keranjang
const totalPrice = computed(() => {
  return cart.value.reduce((total, item) => total + (item.harga * item.jumlah), 0);
});

// Proses transaksi dan kirim data ke server express
const processTransaction = async () => {
  if (cart.value.length === 0) {
    showCustomModal({ title: 'Keranjang Kosong', message: 'Keranjang belanja Anda masih kosong!', status: 'danger' });
    return;
  }

  isProcessing.value = true;

  const finalNamaPembeli = namaPembeli.value.trim() === '' ? 'customer' : namaPembeli.value;

  const transactionData = {
    nama_pelanggan: finalNamaPembeli,
    total_harga: totalPrice.value,
    items: cart.value.map(item => ({
      id_produk: item.id,
      jumlah: item.jumlah,
      harga_saat_transaksi: item.harga
    }))
  };

  try {
    await ApiService.createTransaksi(transactionData);
    showCustomModal({ title: 'Sukses', message: 'Transaksi berhasil diproses!', status: 'success' });
    cart.value = [];
    namaPembeli.value = '';
    fetchProducts();
    router.push(`/transaksi/riwayat`);
  } catch (err) {
    console.error('Gagal memproses transaksi:', err);
    showCustomModal({
        title: 'Gagal',
        message: err.response?.data?.message || 'Terjadi kesalahan saat memproses transaksi.',
        status: 'danger'
    });
  } finally {
    isProcessing.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/150/e0e0e0/333?text=N/A';
};

onMounted(fetchProducts);
</script>

<style scoped>
.product-grid {
  max-height: 65vh;
  overflow-y: auto;
}

.card-product {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  position: relative;
}

.card-product:not(.out-of-stock) {
  cursor: pointer;
}

.card-product:not(.out-of-stock):hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-product .card-img-top {
  height: 120px;
  object-fit: cover;
}

.cart-body {
  max-height: 50vh;
  overflow-y: auto;
}

.card-product.out-of-stock {
  cursor: not-allowed;
}

.card-product.out-of-stock .card-img-top {
  filter: grayscale(100%);
  opacity: 0.7;
}

.stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: var(--bs-card-inner-border-radius);
}

.stock-text {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
  text-align: center;
}

.scroll-to-cart-btn {
  position: fixed;
  bottom: 6rem;
  right: 20px;
  z-index: 1050;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
