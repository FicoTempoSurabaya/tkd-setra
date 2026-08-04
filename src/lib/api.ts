/**
 * API Service
 * Wrapper untuk semua panggilan API ke backend.
 * Sumber: SSoT/04_participant_flow.md, SSoT/05_administration_flow.md
 */

import client from './axios.js';
import type {
  ApiResponse,
  ApiListResponse,
  Participant,
  ParticipantTest,
  Question,
  Game,
  Setting,
  ParticipantDetail,
  SnapshotQuestion,
  SnapshotGame,
  BiodataInput,
  AdminLoginInput,
  CreateQuestionInput,
  CreateGameInput,
  UpdateSettingInput,
  PaginationInput,
} from '@/lib/shared.js';

// ============================================================
// ADMIN AUTH API
// ============================================================
export const adminApi = {
  login: async (data: AdminLoginInput) => {
    const res = await client.post<ApiResponse<{ authenticated: boolean }>>('/admin/login', data);
    return res.data;
  },

  logout: async () => {
    const res = await client.post<ApiResponse>('/admin/logout');
    return res.data;
  },

  checkSession: async () => {
    const res = await client.get<ApiResponse<{ authenticated: boolean }>>('/admin/session');
    return res.data;
  },

  getLockStatus: async () => {
    const res = await client.get<ApiResponse<{ locked: boolean; lockedUntil: string | null }>>(
      '/admin/lock-status',
    );
    return res.data;
  },
};

// ============================================================
// PARTICIPANT API (Public)
// Sumber: SSoT/04_participant_flow.md
// ============================================================
export const participantApi = {
  submitBiodata: async (data: BiodataInput) => {
    const res = await client.post<
      ApiResponse<{ publicToken: string; participantTest: ParticipantTest }>
    >('/participant/biodata', data);
    return res.data;
  },

  getTest: async (publicToken: string) => {
    const res = await client.get<
      ApiResponse<{ test: ParticipantTest; finished: boolean; timeout?: boolean }>
    >(`/participant/test/${publicToken}`);
    return res.data;
  },

  getInstruction: async (publicToken: string) => {
    const res = await client.get<
      ApiResponse<{ instructionContent: unknown; test: ParticipantTest; participant: Participant | null }>
    >(`/participant/instruction/${publicToken}`);
    return res.data;
  },

  startTest: async (publicToken: string) => {
    const res = await client.post<
      ApiResponse<{ test: ParticipantTest; quizSnapshot: SnapshotQuestion[] }>
    >(`/participant/start-test/${publicToken}`);
    return res.data;
  },

  getQuiz: async (publicToken: string) => {
    const res = await client.get<
      ApiResponse<{
        question: Question | null;
        remainingSeconds: number;
        quizFinished: boolean;
      }>
    >(`/participant/quiz/${publicToken}`);
    return res.data;
  },

  submitQuizAnswer: async (publicToken: string, questionOptionId: string) => {
    const res = await client.post<
      ApiResponse<{
        nextQuestion: Question | null;
        quizFinished: boolean;
        gameSnapshot?: SnapshotGame[] | null;
        currentGame?: SnapshotGame | null;
      }>
    >(`/participant/quiz/${publicToken}/answer`, { questionOptionId });
    return res.data;
  },

  getGame: async (publicToken: string) => {
    const res = await client.get<
      ApiResponse<{
        game: Game | null;
        remainingSeconds: number;
        gameFinished: boolean;
        testFinished?: boolean;
      }>
    >(`/participant/game/${publicToken}`);
    return res.data;
  },

  submitGameResult: async (
    publicToken: string,
    data: {
      gameId: string;
      duration: number;
      totalSteps?: number | null;
      totalFoundWords?: number | null;
      status: string;
      foundWordItemIds?: string[];
    },
  ) => {
    const res = await client.post<
      ApiResponse<{
        game: Game | null;
        remainingSeconds: number;
        gameFinished: boolean;
        testFinished?: boolean;
      }>
    >(`/participant/game/${publicToken}/result`, data);
    return res.data;
  },

  getFinish: async (publicToken: string) => {
    const res = await client.get<
      ApiResponse<{
        test: ParticipantTest;
        content: unknown;
        isTimeout: boolean;
        adminWhatsapp: string;
        participant: Participant | null;
      }>
    >(`/participant/finish/${publicToken}`);
    return res.data;
  },

  sendProof: async (publicToken: string) => {
    const res = await client.post<ApiResponse>(`/participant/finish/${publicToken}/send-proof`);
    return res.data;
  },
};

// ============================================================
// ADMIN PARTICIPANT API
// Sumber: SSoT/05_administration_flow.md 5.3, 5.5
// ============================================================
export const adminParticipantApi = {
  list: async (params: PaginationInput) => {
    const res = await client.get<ApiListResponse<Participant>>('/admin/participants', {
      params,
    });
    return res.data;
  },

  getDetail: async (id: string) => {
    const res = await client.get<ApiResponse<ParticipantDetail>>(`/admin/participants/${id}`);
    return res.data;
  },
};

// ============================================================
// ADMIN QUESTION API
// Sumber: SSoT/05_administration_flow.md 5.7-5.14
// ============================================================
export const adminQuestionApi = {
  list: async (params: PaginationInput) => {
    const res = await client.get<ApiListResponse<Question>>('/admin/questions', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await client.get<ApiResponse<Question>>(`/admin/questions/${id}`);
    return res.data;
  },

  create: async (data: CreateQuestionInput) => {
    const res = await client.post<ApiResponse<Question>>('/admin/questions', data);
    return res.data;
  },

  deactivate: async (id: string) => {
    const res = await client.patch<ApiResponse>(`/admin/questions/${id}/deactivate`);
    return res.data;
  },
};

// ============================================================
// ADMIN GAME API
// Sumber: SSoT/05_administration_flow.md, SSoT/07_game_engine.md
// ============================================================
export const adminGameApi = {
  list: async (params: PaginationInput) => {
    const res = await client.get<ApiListResponse<Game>>('/admin/games', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await client.get<ApiResponse<Game>>(`/admin/games/${id}`);
    return res.data;
  },

  create: async (data: CreateGameInput) => {
    const res = await client.post<ApiResponse<Game>>('/admin/games', data);
    return res.data;
  },

  deactivate: async (id: string) => {
    const res = await client.patch<ApiResponse>(`/admin/games/${id}/deactivate`);
    return res.data;
  },
};

// ============================================================
// ADMIN SETTING API
// Sumber: SSoT/05_administration_flow.md 5.15, 5.16
// ============================================================
export const adminSettingApi = {
  get: async () => {
    const res = await client.get<ApiResponse<Setting>>('/admin/settings');
    return res.data;
  },

  update: async (data: UpdateSettingInput) => {
    const res = await client.patch<ApiResponse<Setting>>('/admin/settings', data);
    return res.data;
  },
};
