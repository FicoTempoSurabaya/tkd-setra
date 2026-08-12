/**
 * Shared Types
 * Inlined from packages/shared untuk deployment flat structure.
 */

// ============================================================
// API Response Wrapper
// ============================================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ApiListResponse<T = unknown> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    perPage: number;
  };
}

// ============================================================
// PARTICIPANT
// ============================================================
export interface Participant {
  participantId: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  nik: string;
  address: string;
  whatsapp: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PARTICIPANT TEST
// ============================================================
export interface ParticipantTest {
  participantTestId: string;
  participantId: string;
  publicToken: string;
  status: string;
  quizDuration: number;
  quizStartedAt: string | null;
  quizFinishedAt: string | null;
  currentQuizQuestionId: string | null;
  currentGameId: string | null;
  currentGameStartedAt: string | null;
  testStartedAt: string | null;
  testFinishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// QUESTION
// ============================================================
export interface Question {
  questionId: string;
  questionType: string;
  questionOrder: number;
  questionText: string;
  imageUrl: string | null;
  status: string;
  options: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  questionOptionId: string;
  questionId: string;
  optionOrder: number;
  optionText: string | null;
  imageUrl: string | null;
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// GAME
// ============================================================
export interface Game {
  gameId: string;
  gameType: string;
  gameOrder: number;
  title: string;
  imageUrl: string | null;
  duration: number;
  status: string;
  searchWordItems: SearchWordItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchWordItem {
  searchWordItemId: string;
  gameId: string;
  wordOrder: number;
  word: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// QUIZ ANSWER
// ============================================================
export interface QuizAnswer {
  quizAnswerId: string;
  participantTestId: string;
  questionId: string;
  questionOptionId: string;
  answeredAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// GAME RESULT
// ============================================================
export interface GameResult {
  gameResultId: string;
  participantTestId: string;
  gameId: string;
  duration: number;
  totalSteps: number | null;
  totalFoundWords: number | null;
  status: string;
  searchWordFound: SearchWordFound[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchWordFound {
  searchWordFoundId: string;
  gameResultId: string;
  searchWordItemId: string;
  foundAt: string;
  createdAt: string;
}

// ============================================================
// SETTING
// ============================================================
export interface Setting {
  settingId: string;
  quizDuration: number;
  instructionContent: unknown;
  successContent: unknown;
  timeoutContent: unknown;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// AUTH
// ============================================================
export interface AdminSession {
  administratorId: string;
  issuedAt: number;
  expiresAt: number;
}

// ============================================================
// PAGINATION
// ============================================================
export interface PaginationParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// TIMER STATE (untuk frontend)
// ============================================================
export interface TimerState {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  startedAt: string | null;
  endsAt: string | null;
}

// ============================================================
// SNAPSHOT
// ============================================================
export interface SnapshotQuestion {
  questionId: string;
  questionType: string;
  questionOrder: number;
  questionText: string;
  imageUrl: string | null;
  options: SnapshotOption[];
}

export interface SnapshotOption {
  questionOptionId: string;
  optionOrder: number;
  optionText: string | null;
  imageUrl: string | null;
}

export interface SnapshotGame {
  gameId: string;
  gameType: string;
  gameOrder: number;
  title: string;
  imageUrl: string | null;
  duration: number;
  searchWordItems: { word: string; searchWordItemId: string }[];
}

// ============================================================
// PARTICIPANT DETAIL (untuk admin)
// ============================================================
export interface ParticipantDetail {
  biodata: Participant;
  test: ParticipantTest | null;
  quizAnswers: {
    questionText: string;
    questionType: string;
    questionOrder: number;
    selectedOptionText: string | null;
    selectedOptionImageUrl: string | null;
    answeredAt: string;
  }[];
  gameResults: {
    gameType: string;
    gameTitle: string;
    gameOrder: number;
    status: string;
    duration: number;
    totalSteps: number | null;
    totalFoundWords: number | null;
    foundWords: string[];
  }[];
}

// ============================================================
// VALIDATION SCHEMAS INPUT
// ============================================================
export interface BiodataInput {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  nik: string;
  address: string;
  whatsapp: string;
  email: string;
}

export interface SubmitQuizAnswerInput {
  questionOptionId: string;
}

export interface SubmitGameResultInput {
  gameId: string;
  status: string;
  totalSteps?: number | null;
  totalFoundWords?: number | null;
  foundWordItemIds?: string[];
}