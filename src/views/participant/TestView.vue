<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useParticipantStore } from '@/stores/participant.js';
import { formatDuration } from '@/lib/shared.js';
import SlidingPuzzleGame from '@/components/games/SlidingPuzzleGame.vue';
import SearchWordGame from '@/components/games/SearchWordGame.vue';
import type { SnapshotGame } from '@/lib/shared.js';
import { personalizeRichHtml } from '@/lib/rich-text.js';

const route = useRoute();
const router = useRouter();
const store = useParticipantStore();

const publicToken = computed(() => route.params.publicToken as string);
const phase = ref<'loading' | 'instruction' | 'quiz' | 'game' | 'finished'>('loading');
const agreed = ref(false);
const isSubmitting = ref(false);
const error = ref('');
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);
const displayRemaining = ref(0);
const currentGameSnapshot = ref<SnapshotGame | null>(null);
const selectedOptionId = ref<string | null>(null);
const instructionHtml = ref('');

const isImageBasedAnswer = computed(
  () => store.currentQuestion?.questionType === 'Image Based Answer',
);
const isImageBasedQuestion = computed(
  () => store.currentQuestion?.questionType === 'Image Based Question',
);
const isSemanticDifferential = computed(
  () => store.currentQuestion?.questionType === 'Semantic Differential Scale',
);

async function init() {
  try {
    const res = await store.loadTest(publicToken.value);
    if (res?.finished) {
      router.push(`/participant/finish/${publicToken.value}`);
      return;
    }

    if (store.test?.status === 'Belum Mulai') {
      phase.value = 'instruction';
      await loadInstruction();
    } else if (store.test?.status === 'Sedang Tes') {
      if (store.test.currentGameId) {
        phase.value = 'game';
        await loadCurrentGame();
      } else {
        phase.value = 'quiz';
        await loadCurrentQuiz();
      }
      // Lanjutkan sesi sebelumnya di layar penuh
      await requestFullscreen();
    }
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal memuat tes';
  }
}

async function loadInstruction() {
  const res = await store.loadInstruction(publicToken.value);
  instructionHtml.value = personalizeRichHtml(
    res?.instructionContent,
    res?.participant ?? null,
  );
}

async function startTest() {
  if (!agreed.value) return;
  isSubmitting.value = true;
  try {
    await store.startTest(publicToken.value);
    phase.value = 'quiz';
    await loadCurrentQuiz();
    // Masuk ke layar penuh agar terasa seperti aplikasi native
    await requestFullscreen();
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal memulai tes';
  } finally {
    isSubmitting.value = false;
  }
}

async function loadCurrentQuiz() {
  try {
    const res = await store.loadQuiz(publicToken.value);
    if (res?.quizFinished) {
      phase.value = 'game';
      await loadCurrentGame();
      return;
    }
    if (res?.question) {
      startTimer(res.remainingSeconds);
    }
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal memuat soal';
  }
}

async function selectAnswer(questionOptionId: string) {
  if (isSubmitting.value) return;
  selectedOptionId.value = questionOptionId;
  isSubmitting.value = true;
  try {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 450));
    const res = await store.submitAnswer(publicToken.value, questionOptionId);
    if (res?.quizFinished) {
      stopTimer();
      phase.value = 'game';
      await loadCurrentGame();
    } else {
      selectedOptionId.value = null;
    }
  } catch (e: unknown) {
    selectedOptionId.value = null;
    error.value = (e as { message?: string }).message ?? 'Gagal menyimpan jawaban';
  } finally {
    isSubmitting.value = false;
  }
}

async function loadCurrentGame() {
  try {
    const res = await store.loadGame(publicToken.value);
    if (res?.testFinished) {
      await exitFullscreen();
      router.push(`/participant/finish/${publicToken.value}`);
      return;
    }
if (res?.game) {
      currentGameSnapshot.value = {
        gameId: res.game.gameId,
        gameType: res.game.gameType,
        gameOrder: res.game.gameOrder,
        title: res.game.title,
        imageUrl: res.game.imageUrl,
        duration: res.game.duration,
        searchWordItems: (res.game.searchWordItems ?? []).map(
          (item: { word: string; searchWordItemId: string }) => ({
            word: item.word,
            searchWordItemId: item.searchWordItemId,
          }),
        ),
      };
      startTimer(res.remainingSeconds);
    }
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal memuat game';
  }
}

async function handleGameComplete(data: {
  status: string;
  duration: number;
  totalSteps?: number | null;
  totalFoundWords?: number | null;
  foundWordItemIds?: string[];
}) {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  stopTimer();
  try {
    const res = await store.submitGameResult(publicToken.value, {
      gameId: currentGameSnapshot.value?.gameId ?? '',
      duration: data.duration,
      totalSteps: data.totalSteps,
      totalFoundWords: data.totalFoundWords,
      status: data.status,
      foundWordItemIds: data.foundWordItemIds,
    });

    if (res?.testFinished) {
      await exitFullscreen();
      router.push(`/participant/finish/${publicToken.value}`);
      return;
    }

if (res?.game) {
      currentGameSnapshot.value = {
        gameId: res.game.gameId,
        gameType: res.game.gameType,
        gameOrder: res.game.gameOrder,
        title: res.game.title,
        imageUrl: res.game.imageUrl,
        duration: res.game.duration,
        searchWordItems: (res.game.searchWordItems ?? []).map(
          (item: { word: string; searchWordItemId: string }) => ({
            word: item.word,
            searchWordItemId: item.searchWordItemId,
          }),
        ),
      };
      startTimer(res.remainingSeconds);
    }
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'Gagal menyimpan hasil game';
  } finally {
    isSubmitting.value = false;
  }
}

function startTimer(seconds: number) {
  stopTimer();
  displayRemaining.value = seconds;
  timerInterval.value = setInterval(() => {
    displayRemaining.value = Math.max(0, displayRemaining.value - 1);
    if (displayRemaining.value <= 0) {
      stopTimer();
      if (phase.value === 'quiz') {
        void exitFullscreen();
        router.push(`/participant/finish/${publicToken.value}`);
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
}

/**
 * Meminta layar penuh agar tes terasa seperti aplikasi native
 * (menyembunyikan address bar dan home bar).
 */
async function requestFullscreen() {
  try {
    const doc = window.document;
    const descr =
      doc.fullscreenEnabled ||
      (doc as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
      (doc as unknown as { mozFullScreenEnabled?: boolean }).mozFullScreenEnabled;

    if (!descr) return;

    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
      await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
    } else if ((elem as unknown as { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
      await (elem as unknown as { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
    }
  } catch {
    // Pengguna menolak atau browser tidak mendukung; abaikan saja
  }
}

/**
 * Keluar dari layar penuh ketika tes selesai.
 */
async function exitFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if ((document as unknown as { webkitFullscreenElement?: unknown }).webkitFullscreenElement) {
      (document as unknown as { webkitCancelFullscreen?: () => Promise<void> }).webkitCancelFullscreen?.();
    } else if ((document as unknown as { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
      await (document as unknown as { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
    }
  } catch {
    // abaikan
  }
}

onMounted(() => {
  init();
});

onUnmounted(() => {
  stopTimer();
  void exitFullscreen();
});
</script>

<template>
  <div class="min-h-screen p-4 py-8">
    <div class="max-w-4xl mx-auto">
      <p v-if="error" class="error-text mb-4">{{ error }}</p>

      <div v-if="phase === 'loading'" class="text-center py-12">
        <p class="text-lg">Memuat tes...</p>
      </div>

      <div v-else-if="phase === 'instruction'" class="card-brutal animate-fade-in">
        <h1 class="text-2xl font-black mb-4">Instruksi Tes</h1>
        <div class="rich-content mb-6">
          <div v-if="instructionHtml" v-html="instructionHtml"></div>
          <p v-else>Silakan baca instruksi berikut sebelum memulai tes.</p>
          <p><strong>Durasi tes:</strong> {{ formatDuration(store.test?.quizDuration ?? 0) }}</p>
        </div>

        <label class="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            v-model="agreed"
            type="checkbox"
            class="w-6 h-6 border-[3px] border-brutal-dark"
          />
          <span class="font-bold">Saya telah membaca dan menyetujui instruksi tes</span>
        </label>

        <button
          class="btn-brutal btn-brutal-primary w-full"
          :disabled="!agreed || isSubmitting"
          @click="startTest"
        >
          {{ isSubmitting ? 'Memulai...' : 'Mulai Tes' }}
        </button>
      </div>

      <div v-else-if="phase === 'quiz'" class="animate-fade-in">
        <div class="card-brutal mb-4 flex items-center justify-between">
          <span class="font-bold">Sisa Waktu Quiz</span>
          <span
            class="text-2xl font-black"
            :class="{ 'text-brutal-danger': displayRemaining < 300 }"
          >
            {{ formatDuration(displayRemaining) }}
          </span>
        </div>

        <div v-if="store.currentQuestion" class="card-brutal">
          <div class="mb-4">
            <span class="badge-brutal badge-brutal-info">
              {{ store.currentQuestion.questionType }}
            </span>
          </div>

          <p class="text-lg font-bold mb-4">{{ store.currentQuestion.questionText }}</p>

          <img
            v-if="store.currentQuestion.imageUrl"
            :src="store.currentQuestion.imageUrl"
            alt="Question image"
            class="w-full max-h-[42vh] sm:max-h-[50vh] object-contain bg-gray-50 border-[3px] border-brutal-dark mb-4"
          />

          <div
            v-if="isSemanticDifferential"
            class="overflow-x-auto border-2 border-brutal-dark bg-brutal-bg p-3 sm:p-5"
          >
            <div class="w-max flex items-center gap-4">
              <span class="w-28 flex-shrink-0 text-left text-sm font-bold break-words">
                {{ store.currentQuestion.options[0]?.optionText ?? 'Skala awal' }}
              </span>
              <div class="flex flex-shrink-0 items-center justify-between gap-2">
                <button
                  v-for="(option, index) in store.currentQuestion.options"
                  :key="option.questionOptionId"
                  class="w-10 h-10 flex-shrink-0 rounded-full border-2 border-brutal-dark bg-white text-sm font-bold hover:bg-brutal-primary hover:text-white transition-colors"
                  :class="selectedOptionId === option.questionOptionId ? '!bg-brutal-primary !text-white' : ''"
                  :disabled="isSubmitting"
                  :aria-label="`Pilih skala ${index + 1}`"
                  @click="selectAnswer(option.questionOptionId)"
                >
                  {{ index + 1 }}
                </button>
              </div>
<span class="w-28 flex-shrink-0 text-right text-sm font-bold break-words">
                {{ store.currentQuestion.options[store.currentQuestion.options.length - 1]?.optionText ?? 'Skala akhir' }}
              </span>
            </div>
          </div>

          <div
            v-else
            :class="isImageBasedAnswer ? 'grid grid-cols-2 gap-2 sm:gap-4' : 'space-y-3'"
          >
            <button
              v-for="option in store.currentQuestion.options"
              :key="option.questionOptionId"
              class="btn-brutal w-full !justify-start"
              :class="[
                isImageBasedAnswer ? '!block !p-2 sm:!p-3 text-left overflow-hidden min-w-0' : '',
                isImageBasedQuestion ? '!p-3 sm:!p-4 min-w-0' : '',
                selectedOptionId === option.questionOptionId
                  ? '!border-brutal-primary !bg-brutal-primary !text-white'
                  : '',
              ]"
              :disabled="isSubmitting"
              @click="selectAnswer(option.questionOptionId)"
            >
              <img
                v-if="option.imageUrl"
                :src="option.imageUrl"
                alt="Option"
                :class="
                  isImageBasedAnswer
                    ? 'w-full aspect-[4/3] object-contain bg-gray-50 border-2 border-brutal-dark mb-2 sm:mb-3'
                    : 'w-16 h-16 object-cover border-2 border-brutal-dark mr-3'
                "
              />
              <span :class="isImageBasedAnswer ? 'block break-words text-sm sm:text-base' : 'break-words text-sm sm:text-base'">{{ option.optionText ?? '' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="phase === 'game'" class="animate-fade-in">
        <div class="card-brutal mb-4 flex items-center justify-between">
          <span class="font-bold">
            {{ currentGameSnapshot?.title ?? 'Game' }}
          </span>
          <span
            class="text-2xl font-black"
            :class="{ 'text-brutal-danger': displayRemaining < 60 }"
          >
            {{ formatDuration(displayRemaining) }}
          </span>
        </div>

        <SlidingPuzzleGame
          v-if="currentGameSnapshot?.gameType === 'Image Sliding Puzzle'"
          :key="`${currentGameSnapshot.gameId}-sliding`"
          :game="currentGameSnapshot"
          :remaining-seconds="displayRemaining"
          @complete="handleGameComplete"
        />

        <SearchWordGame
          v-else-if="currentGameSnapshot?.gameType === 'Search Word'"
          :key="`${currentGameSnapshot.gameId}-search`"
          :game="currentGameSnapshot"
          :remaining-seconds="displayRemaining"
          :seed="publicToken"
          @complete="handleGameComplete"
        />
      </div>
    </div>
  </div>
</template>
