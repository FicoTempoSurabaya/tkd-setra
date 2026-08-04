<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Lock } from 'lucide-vue-next';
import { useAdminStore } from '@/stores/admin.js';

const router = useRouter();
const adminStore = useAdminStore();

const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleSubmit() {
  error.value = '';
  if (!password.value) {
    error.value = 'Password wajib diisi';
    return;
  }

  isLoading.value = true;
  try {
    await adminStore.login(password.value);
    router.push('/admin/dashboard');
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal login';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card-brutal max-w-md w-full animate-fade-in">
      <button class="btn-brutal mb-6" @click="router.push('/')">
        <ArrowLeft :size="18" />
        Kembali
      </button>

      <div class="text-center mb-6">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-brutal-dark border-[3px] border-brutal-dark flex items-center justify-center"
          
        >
          <Lock :size="28" color="white" />
        </div>
        <h1 class="text-2xl font-black">Login Administrator</h1>
        <p class="text-gray-600 text-sm mt-1">Masukkan password untuk mengakses dashboard</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label-brutal" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="input-brutal"
            placeholder="Masukkan password"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <button
          type="submit"
          class="btn-brutal btn-brutal-primary w-full"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Memproses...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>