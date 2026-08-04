<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card-brutal max-w-md w-full text-center animate-fade-in">
      <h1 class="text-6xl font-black mb-4">404</h1>
      <p class="text-lg mb-6">Halaman tidak ditemukan</p>
      <button class="btn-brutal btn-brutal-primary" @click="router.push('/')">
        Kembali ke Beranda
      </button>
    </div>
  </div>
</template>