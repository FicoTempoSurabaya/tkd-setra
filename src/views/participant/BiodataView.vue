<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import { biodataSchema, normalizeWhatsapp } from '@/lib/shared.js';
import { participantApi } from '@/lib/api.js';

const router = useRouter();

const form = reactive({
  fullName: '',
  birthPlace: '',
  birthDate: '',
  nik: '',
  address: '',
  whatsapp: '',
  email: '',
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const submitError = ref('');

async function handleSubmit() {
  errors.value = {};
  submitError.value = '';

  const data = {
    ...form,
    whatsapp: form.whatsapp.startsWith('0') ? normalizeWhatsapp(form.whatsapp) : form.whatsapp,
  };

  const parsed = biodataSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!errors.value[key]) {
        errors.value[key] = issue.message;
      }
    }
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await participantApi.submitBiodata(parsed.data);
    if (res.data?.publicToken) {
      router.push(`/participant/test/${res.data.publicToken}`);
    }
  } catch (e: unknown) {
    submitError.value = (e as { message?: string }).message ?? 'Gagal menyimpan biodata';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen p-4 py-8">
    <div class="max-w-2xl mx-auto">
      <button class="btn-brutal mb-6" @click="router.push('/')">
        <ArrowLeft :size="18" />
        Kembali
      </button>

      <div class="card-brutal animate-fade-in">
        <h1 class="text-2xl font-black mb-6">Form Biodata</h1>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label-brutal" for="fullName">Nama Lengkap</label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              class="input-brutal"
              placeholder="Masukkan nama lengkap"
            />
            <p v-if="errors.fullName" class="error-text">{{ errors.fullName }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label-brutal" for="birthPlace">Tempat Lahir</label>
              <input
                id="birthPlace"
                v-model="form.birthPlace"
                type="text"
                class="input-brutal"
                placeholder="Tempat lahir"
              />
              <p v-if="errors.birthPlace" class="error-text">{{ errors.birthPlace }}</p>
            </div>

            <div>
              <label class="label-brutal" for="birthDate">Tanggal Lahir</label>
              <input
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                class="input-brutal"
              />
              <p v-if="errors.birthDate" class="error-text">{{ errors.birthDate }}</p>
            </div>
          </div>

          <div>
            <label class="label-brutal" for="nik">NIK (16 digit)</label>
            <input
              id="nik"
              v-model="form.nik"
              type="text"
              inputmode="numeric"
              maxlength="16"
              class="input-brutal"
              placeholder="16 digit angka"
              @input="form.nik = (form.nik || '').replace(/\D/g, '')"
            />
            <p v-if="errors.nik" class="error-text">{{ errors.nik }}</p>
          </div>

          <div>
            <label class="label-brutal" for="address">Alamat</label>
            <textarea
              id="address"
              v-model="form.address"
              class="input-brutal"
              rows="3"
              placeholder="Masukkan alamat"
            ></textarea>
            <p v-if="errors.address" class="error-text">{{ errors.address }}</p>
          </div>

          <div>
            <label class="label-brutal" for="whatsapp">Nomor WhatsApp</label>
            <input
              id="whatsapp"
              v-model="form.whatsapp"
              type="tel"
              maxlength="14"
              class="input-brutal"
              placeholder="08xxxxxxxxxx atau 62xxx"
              @input="form.whatsapp = form.whatsapp.replace(/\D/g, '')"
            />
            <p v-if="errors.whatsapp" class="error-text">{{ errors.whatsapp }}</p>
          </div>

          <div>
            <label class="label-brutal" for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="input-brutal"
              placeholder="email@example.com"
            />
            <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
          </div>

          <p v-if="submitError" class="error-text">{{ submitError }}</p>

          <button
            type="submit"
            class="btn-brutal btn-brutal-primary w-full"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Memproses...' : 'Ajukan Tes' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>