<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, RouterView, RouterLink } from 'vue-router';
import { LogOut, Users, BookOpen, Settings } from 'lucide-vue-next';
import { useAdminStore } from '@/stores/admin.js';

const router = useRouter();
const adminStore = useAdminStore();

async function handleLogout() {
  await adminStore.logout();
  router.push('/');
}

onMounted(() => {
  adminStore.checkSession();
});
</script>

<template>
  <div class="min-h-screen">
    <header class="bg-brutal-dark text-white border-b-[3px] border-brutal-dark sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-black">Dashboard Administrator</h1>
        <button class="btn-brutal btn-brutal-danger !py-2 !px-4 !text-sm" @click="handleLogout">
          <LogOut :size="16" />
          Logout
        </button>
      </div>
    </header>

    <nav class="bg-brutal-secondary border-b-[3px] border-brutal-dark overflow-x-auto">
      <div class="max-w-7xl mx-auto px-4 flex gap-2 py-3">
        <RouterLink
          to="/admin/dashboard/participants"
          class="btn-brutal !py-2 !px-4 !text-sm whitespace-nowrap"
          active-class="!bg-brutal-primary !text-white"
        >
          <Users :size="16" />
          Participant
        </RouterLink>

        <RouterLink
          to="/admin/dashboard/bank-soal"
          class="btn-brutal !py-2 !px-4 !text-sm whitespace-nowrap"
          active-class="!bg-brutal-primary !text-white"
        >
          <BookOpen :size="16" />
          Bank Soal
        </RouterLink>

        <RouterLink
          to="/admin/dashboard/settings"
          class="btn-brutal !py-2 !px-4 !text-sm whitespace-nowrap"
          active-class="!bg-brutal-primary !text-white"
        >
          <Settings :size="16" />
          Settings
        </RouterLink>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto p-4 py-6">
      <RouterView />
    </main>
  </div>
</template>