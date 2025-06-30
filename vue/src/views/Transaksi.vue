<template>
  <div class="container-fluid">
    <h1 class="h3 mb-4 text-gray-800">Menu Transaksi</h1>

    <div class="row">
      <!-- Daftar Produk -->
      <div class="col-lg-8">
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Pilih Produk</h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <input type="text" class="form-control" placeholder="Cari produk..." v-model="searchQuery">
            </div>
            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-else class="row g-3" style="max-height: 60vh; overflow-y: auto;">
              <div v-if="filteredProducts.length === 0" class="col-12 text-center text-muted">
                Produk tidak ditemukan.
              </div>
              <div class="col-md-4 col-sm-6" v-for="product in filteredProducts" :key="product.id">
                <div class="card h-100 card-product" @click="addToCart(product)">
                  <div class="card-body text-center">
                    <h5 class="card-title fs-6">{{ product.nama }}</h5>
                    <p class="card-text fw-bold text-success">{{ formatCurrency(product.harga) }}</p>
                    <p class="card-text"><small class="text-muted">Stok: {{ product.stok }}</small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Keranjang Belanja -->
      <div class="col-lg-4">
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Pembelian</h6>
          </div>
          <div class="card-body">
            <div v-if="cart.length === 0" class="text-center text-muted">
              kosong.
            </div>
            <ul v-else class="list-group list-group-flush" style="max-height: 45vh; overflow-y: auto;">
              <li v-for="(item, index) in cart" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="my-0">{{ item.nama }}</h6>
                  <small class="text-muted">{{ formatCurrency(item.harga) }}</small>
                </div>
                <div class="d-flex align-items-center">
                  <button class="btn btn-sm btn-outline-secondary" @click="decreaseQuantity(item)">-</button>
                  <span class="mx-2">{{ item.jumlah }}</span>
                  <button class="btn btn-sm btn-outline-secondary" @click="increaseQuantity(item)">+</button>
                  <button class="btn btn-sm btn-danger ms-3" @click="removeFromCart(item.id)">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-footer" v-if="cart.length > 0">
            <div class="d-flex justify-content-between fw-bold fs-5">
              <span>Total:</span>
              <span>{{ formatCurrency(totalPrice) }}</span>
            </div>
            <div class="d-grid mt-3">
              <button class="btn btn-success" @click="processTransaction" :disabled="isProcessing">
                <span v-if="isProcessing" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {{ isProcessing ? 'Memproses...' : 'Bayar Sekarang' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ApiService from '../services/ApiService';
import { useRouter } from 'vue-router';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const cart = ref([]);
const isProcessing = ref(false);
const router = useRouter();

const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await ApiService.getProduk();
    products.value = response.data.filter(p => p.stok > 0); // Hanya tampilkan produk yang ada stok
  } catch (err) {
    error.value = 'Gagal memuat data produk.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return products.value;
  }
  return products.value.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const addToCart = (product) => {
  const existingItem = cart.value.find(item => item.id === product.id);
  if (existingItem) {
    if (existingItem.jumlah < product.stok) {
      existingItem.jumlah++;
    } else {
      alert('Stok produk tidak mencukupi.');
    }
  } else {
    if (product.stok > 0) {
      cart.value.push({ ...product, jumlah: 1 });
    } else {
       alert('Stok produk habis.');
    }
  }
};

const removeFromCart = (productId) => {
  cart.value = cart.value.filter(item => item.id !== productId);
};

const increaseQuantity = (item) => {
  const productInStock = products.value.find(p => p.id === item.id);
  if (item.jumlah < productInStock.stok) {
    item.jumlah++;
  } else {
    alert('Stok produk tidak mencukupi.');
  }
};

const decreaseQuantity = (item) => {
  if (item.jumlah > 1) {
    item.jumlah--;
  } else {
    removeFromCart(item.id);
  }
};

const totalPrice = computed(() => {
  return cart.value.reduce((total, item) => total + (item.harga * item.jumlah), 0);
});

const processTransaction = async () => {
  if (cart.value.length === 0) {
    alert('Keranjang kosong!');
    return;
  }

  isProcessing.value = true;
  const transactionData = {
    items: cart.value.map(item => ({
      id_produk: item.id,
      jumlah: item.jumlah,
      harga_saat_transaksi: item.harga
    }))
  };

  try {
    await ApiService.createTransaksi(transactionData);
    alert('Transaksi berhasil!');
    cart.value = [];
    fetchProducts(); // Refresh product list to update stock
    router.push('/transaksi/riwayat');
  } catch (err) {
    console.error('Gagal memproses transaksi:', err);
    alert(err.response?.data?.message || 'Terjadi kesalahan saat memproses transaksi.');
  } finally {
    isProcessing.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

onMounted(fetchProducts);
</script>