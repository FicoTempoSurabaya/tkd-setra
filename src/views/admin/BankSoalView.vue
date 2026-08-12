<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Search, Plus, ChevronLeft, ChevronRight, Ban, Eye } from '@lucide/vue';
import { useAdminStore } from '@/stores/admin.js';
import { truncate, type Game, type Question } from '@/lib/shared.js';
import QuestionFormModal from '@/components/admin/QuestionFormModal.vue';
import GameFormModal from '@/components/admin/GameFormModal.vue';
import PreviewModal from '@/components/admin/PreviewModal.vue';

const adminStore = useAdminStore();
const searchInput = ref('');
const showAddQuestion = ref(false);
const showAddGame = ref(false);
const previewQuestion = ref<Question | null>(null);
const previewGame = ref<Game | null>(null);

const previewOptions = computed(() => previewQuestion.value?.options ?? []);
const previewTextOptions = computed(() => previewOptions.value.map((option) => option.optionText ?? ''));
const previewImageOptions = computed(() =>
  previewOptions.value.map((option) => ({
    imageUrl: option.imageUrl ?? '',
    label: option.optionText ?? '',
  })),
);
const previewScaleStart = computed(() => previewOptions.value[0]?.optionText ?? '');
const previewScaleEnd = computed(
  () => previewOptions.value[previewOptions.value.length - 1]?.optionText ?? '',
);

async function handleSearch() {
  adminStore.questionSearch = searchInput.value;
  adminStore.questionPage = 1;
  await adminStore.loadQuestions();
}

async function changePage(delta: number) {
  adminStore.questionPage += delta;
  await adminStore.loadQuestions();
}

async function handleDeactivate(id: string) {
  if (confirm('Nonaktifkan pertanyaan ini?')) {
    await adminStore.deactivateQuestion(id);
  }
}

function showQuestionPreview(question: Question) {
  previewGame.value = null;
  previewQuestion.value = question;
}

function showGamePreview(game: Game) {
  previewQuestion.value = null;
  previewGame.value = game;
}

function closePreview() {
  previewQuestion.value = null;
  previewGame.value = null;
}

onMounted(() => {
  adminStore.loadQuestions();
  adminStore.loadGames();
});
</script>

<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-black">Pertanyaan (Quiz)</h2>
        <button class="btn-brutal btn-brutal-primary !py-2 !px-4 !text-sm" @click="showAddQuestion = !showAddQuestion">
          <Plus :size="16" />
          Tambah Pertanyaan
        </button>
      </div>

      <div class="flex items-center gap-4 mb-4">
        <div class="flex-1 relative">
          <input
            v-model="searchInput"
            type="text"
            class="input-brutal pl-10"
            placeholder="    Cari pertanyaan..."
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
              <th>Jenis</th>
              <th>Tipe</th>
              <th>Nomor Urut</th>
              <th>Pertanyaan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="adminStore.questions.length === 0">
              <td colspan="5" class="text-center py-8">Tidak ada data</td>
            </tr>
            <tr v-for="q in adminStore.questions" :key="q.questionId">
              <td><span class="badge-brutal badge-brutal-info">Quiz</span></td>
              <td>{{ q.questionType }}</td>
              <td>{{ q.questionOrder }}</td>
              <td>{{ truncate(q.questionText, 60) }}</td>
              <td>
                <div class="flex flex-wrap gap-2">
                  <button class="btn-brutal !py-1 !px-2 !text-xs" @click="showQuestionPreview(q)">
                    <Eye :size="14" />
                    Preview
                  </button>
                  <button
                    class="btn-brutal btn-brutal-danger !py-1 !px-2 !text-xs"
                    @click="handleDeactivate(q.questionId)"
                  >
                    <Ban :size="14" />
                    Nonaktifkan
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between mt-4">
        <p class="text-sm">Halaman {{ adminStore.questionPage }} - Total: {{ adminStore.questionTotal }}</p>
        <div class="flex gap-2">
          <button class="btn-brutal !py-2 !px-3" :disabled="adminStore.questionPage <= 1" @click="changePage(-1)">
            <ChevronLeft :size="16" />
          </button>
          <button
            class="btn-brutal !py-2 !px-3"
            :disabled="adminStore.questions.length < adminStore.questionPerPage"
            @click="changePage(1)"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-black">Game</h2>
        <button class="btn-brutal btn-brutal-primary !py-2 !px-4 !text-sm" @click="showAddGame = !showAddGame">
          <Plus :size="16" />
          Tambah Game
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table-brutal">
          <thead>
            <tr>
              <th>Jenis</th>
              <th>Tipe</th>
              <th>Nomor Urut</th>
              <th>Judul</th>
              <th>Durasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="adminStore.games.length === 0">
              <td colspan="6" class="text-center py-8">Tidak ada data</td>
            </tr>
            <tr v-for="g in adminStore.games" :key="g.gameId">
              <td><span class="badge-brutal badge-brutal-warning">Game</span></td>
              <td>{{ g.gameType }}</td>
              <td>{{ g.gameOrder }}</td>
              <td>{{ g.title }}</td>
              <td>{{ g.duration }}s</td>
              <td>
                <div class="flex flex-wrap gap-2">
                  <button class="btn-brutal !py-1 !px-2 !text-xs" @click="showGamePreview(g)">
                    <Eye :size="14" />
                    Preview
                  </button>
                  <button
                    class="btn-brutal btn-brutal-danger !py-1 !px-2 !text-xs"
                    @click="adminStore.deactivateGame(g.gameId)"
                  >
                    <Ban :size="14" />
                    Nonaktifkan
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Modal Tambah Pertanyaan -->
    <QuestionFormModal
      :show="showAddQuestion"
      @close="showAddQuestion = false"
      @saved="showAddQuestion = false"
    />

    <!-- Modal Tambah Game -->
    <GameFormModal
      :show="showAddGame"
      @close="showAddGame = false"
      @saved="showAddGame = false"
    />

    <PreviewModal
      :show="Boolean(previewQuestion || previewGame)"
      :question-type="previewQuestion?.questionType ?? ''"
      :question-text="previewQuestion?.questionText ?? ''"
      :image-url="previewQuestion?.imageUrl ?? ''"
      :text-options="previewTextOptions"
      :image-options="previewImageOptions"
      :scale-options="previewTextOptions"
      :scale-start="previewScaleStart"
      :scale-end="previewScaleEnd"
      :scale-count="previewOptions.length"
      :game-data="previewGame"
      @close="closePreview"
    />
  </div>
</template>
