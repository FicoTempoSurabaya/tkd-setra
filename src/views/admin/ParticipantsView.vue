<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Search, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useAdminStore } from '@/stores/admin.js';
import { formatDateId } from '@tkd-setra/shared';

const router = useRouter();
const adminStore = useAdminStore();
const searchInput = ref('');

async function handleSearch() {
  adminStore.participantSearch = searchInput.value;
  adminStore.participantPage = 1;
  await adminStore.loadParticipants();
}

function handleSort(column: string) {
  if (adminStore.participantSortBy === column) {
    adminStore.participantSortOrder = adminStore.participantSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    adminStore.participantSortBy = column;
    adminStore.participantSortOrder = 'asc';
  }
  adminStore.loadParticipants();
}

async function changePage(delta: number) {
  adminStore.participantPage += delta;
  await adminStore.loadParticipants();
}

onMounted(() => {
  adminStore.loadParticipants();
});
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <div class="flex-1 relative">
        <input
          v-model="searchInput"
          type="text"
          class="input-brutal pl-10"
          placeholder="    Cari participant..."
          @keyup.enter="handleSearch"
        />
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <button class="btn-brutal btn-brutal-primary" @click="handleSearch">Cari</button>
    </div>

    <div class="overflow-x-auto">
      <table class="table-brutal">
        <thead>
          <tr>
            <th @click="handleSort('fullName')">Nama</th>
            <th @click="handleSort('nik')">NIK</th>
            <th @click="handleSort('birthDate')">Tanggal Lahir</th>
            <th @click="handleSort('birthPlace')">Tempat Lahir</th>
            <th>Alamat</th>
            <th @click="handleSort('whatsapp')">WhatsApp</th>
            <th @click="handleSort('email')">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="adminStore.participants.length === 0">
            <td colspan="7" class="text-center py-8">Tidak ada data</td>
          </tr>
          <tr
            v-for="p in adminStore.participants"
            :key="p.participantId"
            class="cursor-pointer"
            @click="router.push(`/admin/dashboard/participants/${p.participantId}`)"
          >
            <td class="font-bold">{{ p.fullName }}</td>
            <td>{{ p.nik }}</td>
            <td>{{ formatDateId(p.birthDate) }}</td>
            <td>{{ p.birthPlace }}</td>
            <td class="max-w-xs truncate">{{ p.address }}</td>
            <td>{{ p.whatsapp }}</td>
            <td>{{ p.email }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-4">
      <p class="text-sm">
        Halaman {{ adminStore.participantPage }} - Total: {{ adminStore.participantTotal }}
      </p>
      <div class="flex gap-2">
        <button
          class="btn-brutal !py-2 !px-3"
          :disabled="adminStore.participantPage <= 1"
          @click="changePage(-1)"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          class="btn-brutal !py-2 !px-3"
          :disabled="adminStore.participants.length < adminStore.participantPerPage"
          @click="changePage(1)"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>