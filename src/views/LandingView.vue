<script setup lang="ts">
import { useRouter } from 'vue-router';
import { User, Lock } from 'lucide-vue-next';

const router = useRouter();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card-brutal max-w-md w-full text-center animate-fade-in">
      <div class="mb-8">
        <div
          class="w-24 h-24 mx-auto mb-4 bg-brutal-primary border-[3px] border-brutal-dark flex items-center justify-center"
          style="box-shadow: 6px 6px 0px 0px #1a1a1a"
        >
          <span class="text-4xl font-black text-white">T</span>
        </div>
        <h1 class="text-3xl font-black mb-2">Online Test</h1>
        <p class="text-gray-600">Aplikasi Tes Online</p>
      </div>

      <div class="space-y-4">
        <button
          class="btn-brutal btn-brutal-primary w-full"
          @click="router.push('/participant/biodata')"
        >
          <User :size="20" />
          Participant
        </button>

        <button
          class="btn-brutal w-full"
          @click="router.push('/admin/login')"
        >
          <Lock :size="20" />
          Login Administrator
        </button>
      </div>
    </div>
  </div>
</template>