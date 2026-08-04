/**
 * Admin Store
 * Mengelola state admin session dan dashboard.
 * Sumber: SSoT/05_administration_flow.md
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminApi, adminParticipantApi, adminQuestionApi, adminGameApi, adminSettingApi } from '@/lib/api.js';
import type { Participant, Question, Game, Setting, PaginationInput } from '@/lib/shared.js';

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string>('');

  const participantPage = ref(1);
  const participantPerPage = ref(10);
  const participantSearch = ref('');
  const participantSortBy = ref('createdAt');
  const participantSortOrder = ref<'asc' | 'desc'>('desc');
  const participantTotal = ref(0);
  const participants = ref<Participant[]>([]);

  const questionPage = ref(1);
  const questionPerPage = ref(10);
  const questionSearch = ref('');
  const questionSortBy = ref('questionOrder');
  const questionSortOrder = ref<'asc' | 'desc'>('asc');
  const questionTotal = ref(0);
  const questions = ref<Question[]>([]);

  const gamePage = ref(1);
  const gamePerPage = ref(10);
  const gameSearch = ref('');
  const gameSortBy = ref('gameOrder');
  const gameSortOrder = ref<'asc' | 'desc'>('asc');
  const gameTotal = ref(0);
  const games = ref<Game[]>([]);

  const setting = ref<Setting | null>(null);

  async function login(password: string) {
    isLoading.value = true;
    error.value = '';
    try {
      const res = await adminApi.login({ password });
      isAuthenticated.value = res.data?.authenticated ?? false;
      return res;
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message ?? 'Gagal login';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      await adminApi.logout();
    } finally {
      isAuthenticated.value = false;
    }
  }

  async function checkSession() {
    try {
      const res = await adminApi.checkSession();
      isAuthenticated.value = res.data?.authenticated ?? false;
      return isAuthenticated.value;
    } catch {
      isAuthenticated.value = false;
      return false;
    }
  }

  async function loadParticipants() {
    isLoading.value = true;
    try {
      const params: PaginationInput = {
        page: participantPage.value,
        perPage: participantPerPage.value,
        search: participantSearch.value || undefined,
        sortBy: participantSortBy.value,
        sortOrder: participantSortOrder.value,
      };
      const res = await adminParticipantApi.list(params);
      participants.value = res.data?.items ?? [];
      participantTotal.value = res.data?.total ?? 0;
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message ?? 'Gagal memuat data';
    } finally {
      isLoading.value = false;
    }
  }

  async function loadParticipantDetail(id: string) {
    const res = await adminParticipantApi.getDetail(id);
    return res.data;
  }

  async function loadQuestions() {
    isLoading.value = true;
    try {
      const params: PaginationInput = {
        page: questionPage.value,
        perPage: questionPerPage.value,
        search: questionSearch.value || undefined,
        sortBy: questionSortBy.value,
        sortOrder: questionSortOrder.value,
      };
      const res = await adminQuestionApi.list(params);
      questions.value = res.data?.items ?? [];
      questionTotal.value = res.data?.total ?? 0;
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message ?? 'Gagal memuat data';
    } finally {
      isLoading.value = false;
    }
  }

  async function createQuestion(data: Parameters<typeof adminQuestionApi.create>[0]) {
    await adminQuestionApi.create(data);
    await loadQuestions();
  }

  async function deactivateQuestion(id: string) {
    await adminQuestionApi.deactivate(id);
    await loadQuestions();
  }

  async function loadGames() {
    isLoading.value = true;
    try {
      const params: PaginationInput = {
        page: gamePage.value,
        perPage: gamePerPage.value,
        search: gameSearch.value || undefined,
        sortBy: gameSortBy.value,
        sortOrder: gameSortOrder.value,
      };
      const res = await adminGameApi.list(params);
      games.value = res.data?.items ?? [];
      gameTotal.value = res.data?.total ?? 0;
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message ?? 'Gagal memuat data';
    } finally {
      isLoading.value = false;
    }
  }

  async function createGame(data: Parameters<typeof adminGameApi.create>[0]) {
    await adminGameApi.create(data);
    await loadGames();
  }

  async function deactivateGame(id: string) {
    await adminGameApi.deactivate(id);
    await loadGames();
  }

  async function loadSetting() {
    const res = await adminSettingApi.get();
    setting.value = res.data ?? null;
  }

  async function updateSetting(data: Parameters<typeof adminSettingApi.update>[0]) {
    const res = await adminSettingApi.update(data);
    setting.value = res.data ?? null;
  }

  return {
    isAuthenticated,
    isLoading,
    error,
    participantPage,
    participantPerPage,
    participantSearch,
    participantSortBy,
    participantSortOrder,
    participantTotal,
    participants,
    questionPage,
    questionPerPage,
    questionSearch,
    questionSortBy,
    questionSortOrder,
    questionTotal,
    questions,
    gamePage,
    gamePerPage,
    gameSearch,
    gameSortBy,
    gameSortOrder,
    gameTotal,
    games,
    setting,
    login,
    logout,
    checkSession,
    loadParticipants,
    loadParticipantDetail,
    loadQuestions,
    createQuestion,
    deactivateQuestion,
    loadGames,
    createGame,
    deactivateGame,
    loadSetting,
    updateSetting,
  };
});