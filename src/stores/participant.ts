/**
 * Participant Store
 * Mengelola state participant selama tes berlangsung.
 * Sumber: SSoT/04_participant_flow.md, SSoT/03_authentication.md 3.13-3.15
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ParticipantTest, Question, Game, SnapshotQuestion, SnapshotGame } from '@/lib/shared.js';
import { participantApi } from '@/lib/api.js';

export const useParticipantStore = defineStore('participant', () => {
  const publicToken = ref<string>('');
  const test = ref<ParticipantTest | null>(null);
  const currentQuestion = ref<Question | null>(null);
  const currentGame = ref<Game | null>(null);
  const quizSnapshot = ref<SnapshotQuestion[]>([]);
  const gameSnapshot = ref<SnapshotGame[]>([]);
  const remainingSeconds = ref<number>(0);
  const isLoading = ref(false);
  const error = ref<string>('');

  async function loadTest(token: string) {
    isLoading.value = true;
    error.value = '';
    try {
      publicToken.value = token;
      const res = await participantApi.getTest(token);
      test.value = res.data?.test ?? null;
      return res.data;
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message ?? 'Gagal memuat tes';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadInstruction(token: string) {
    const res = await participantApi.getInstruction(token);
    return res.data;
  }

  async function startTest(token: string) {
    isLoading.value = true;
    error.value = '';
    try {
      const res = await participantApi.startTest(token);
      test.value = res.data?.test ?? null;
      quizSnapshot.value = res.data?.quizSnapshot ?? [];
      return res.data;
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message ?? 'Gagal memulai tes';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadQuiz(token: string) {
    const res = await participantApi.getQuiz(token);
    currentQuestion.value = res.data?.question ?? null;
    remainingSeconds.value = res.data?.remainingSeconds ?? 0;
    return res.data;
  }

  async function submitAnswer(token: string, questionOptionId: string) {
    const res = await participantApi.submitQuizAnswer(token, questionOptionId);
    currentQuestion.value = res.data?.nextQuestion ?? null;
    if (res.data?.gameSnapshot) {
      gameSnapshot.value = res.data.gameSnapshot;
    }
    return res.data;
  }

  async function loadGame(token: string) {
    const res = await participantApi.getGame(token);
    currentGame.value = res.data?.game ?? null;
    remainingSeconds.value = res.data?.remainingSeconds ?? 0;
    return res.data;
  }

  async function submitGameResult(
    token: string,
    data: {
      gameId: string;
      duration: number;
      totalSteps?: number | null;
      totalFoundWords?: number | null;
      status: string;
      foundWordItemIds?: string[];
    },
  ) {
    const res = await participantApi.submitGameResult(token, data);
    currentGame.value = res.data?.game ?? null;
    remainingSeconds.value = res.data?.remainingSeconds ?? 0;
    return res.data;
  }

  async function loadFinish(token: string) {
    const res = await participantApi.getFinish(token);
    return res.data;
  }

  function reset() {
    publicToken.value = '';
    test.value = null;
    currentQuestion.value = null;
    currentGame.value = null;
    quizSnapshot.value = [];
    gameSnapshot.value = [];
    remainingSeconds.value = 0;
    error.value = '';
  }

  return {
    publicToken,
    test,
    currentQuestion,
    currentGame,
    quizSnapshot,
    gameSnapshot,
    remainingSeconds,
    isLoading,
    error,
    loadTest,
    loadInstruction,
    startTest,
    loadQuiz,
    submitAnswer,
    loadGame,
    submitGameResult,
    loadFinish,
    reset,
  };
});