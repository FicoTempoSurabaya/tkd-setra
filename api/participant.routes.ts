/**
 * Participant Routes (Serverless)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  participantRepository,
  participantTestRepository,
  quizAnswerRepository,
  gameResultRepository,
  settingRepository,
  snapshotRepository,
  questionRepository,
  gameRepository,
  participantDetailRepository,
} from './repositories.js';
import { sendSuccess, sendList, sendError } from './response.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  MaintenanceError,
} from './errors.js';
import { getConfig } from './config.js';
import {
  biodataSchema,
  submitQuizAnswerSchema,
  submitGameResultSchema,
  paginationSchema,
  calculateRemainingSeconds,
} from './schemas.js';

export function participantPublicRoutes(fastify: FastifyInstance): void {
  // POST /api/participant/biodata
  fastify.post('/biodata', async (request: FastifyRequest, reply: FastifyReply) => {
    const setting = await settingRepository.get();
    if (setting.maintenanceMode) {
      throw new MaintenanceError('Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.');
    }

    const parsed = biodataSchema.safeParse(request.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError('Data tidak valid', errors);
    }

    const data = parsed.data;

    const existingNik = await participantRepository.findByNik(data.nik);
    if (existingNik) {
      throw new ConflictError('NIK sudah terdaftar. Silakan gunakan URL Tes yang telah diberikan.');
    }

    const existingEmail = await participantRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('Email sudah terdaftar.');
    }

    const participant = await participantRepository.create(data);
    const test = await participantTestRepository.create({
      participantId: participant.participantId,
      quizDuration: setting.quizDuration,
    });

    return sendSuccess(
      reply,
      'Biodata berhasil disimpan. Silakan baca instruksi.',
      { publicToken: test.publicToken, participantTest: test },
      201,
    );
  });

  // GET /api/participant/test/:publicToken
  fastify.get(
    '/test/:publicToken',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      if (test.status === 'Selesai' || test.status === 'Waktu Habis') {
        return sendSuccess(reply, 'Tes telah selesai', { test, finished: true });
      }

      if (test.status === 'Sedang Tes' && test.quizStartedAt) {
        const remaining = calculateRemainingSeconds(test.quizStartedAt, test.quizDuration);
        if (remaining <= 0 && !test.quizFinishedAt) {
          await participantTestRepository.finishTest(test.participantTestId, 'Waktu Habis');
          const updatedTest = await participantTestRepository.findByPublicToken(publicToken);
          return sendSuccess(reply, 'Waktu tes habis', {
            test: updatedTest,
            finished: true,
            timeout: true,
          });
        }
      }

      return sendSuccess(reply, 'Data tes', { test, finished: false });
    },
  );

  // GET /api/participant/instruction/:publicToken
  fastify.get(
    '/instruction/:publicToken',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      const setting = await settingRepository.get();
      const participant = await participantRepository.findById(test.participantId);
      return sendSuccess(reply, 'Instruksi tes', {
        instructionContent: setting.instructionContent,
        test,
        participant,
      });
    },
  );

  // POST /api/participant/start-test/:publicToken
  fastify.post(
    '/start-test/:publicToken',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      if (test.status !== 'Belum Mulai') {
        throw new ConflictError('Tes sudah dimulai atau selesai.');
      }

      const setting = await settingRepository.get();
      if (setting.maintenanceMode) {
        throw new MaintenanceError('Sistem sedang dalam pemeliharaan.');
      }

      const updatedTest = await participantTestRepository.startTest(test.participantTestId);
      const quizSnapshot = await snapshotRepository.getQuizSnapshot();

      if (quizSnapshot.length > 0) {
        await participantTestRepository.updateCurrentQuizQuestion(
          test.participantTestId,
          quizSnapshot[0].questionId,
        );
      }

      return sendSuccess(reply, 'Tes dimulai', { test: updatedTest, quizSnapshot });
    },
  );

  // GET /api/participant/quiz/:publicToken
  fastify.get(
    '/quiz/:publicToken',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      if (test.status !== 'Sedang Tes') {
        throw new ConflictError('Tes belum dimulai atau sudah selesai.');
      }

      if (test.quizStartedAt) {
        const remaining = calculateRemainingSeconds(test.quizStartedAt, test.quizDuration);
        if (remaining <= 0) {
          await participantTestRepository.finishTest(test.participantTestId, 'Waktu Habis');
          return sendError(reply, 'Waktu tes habis', 408);
        }
      }

      if (!test.currentQuizQuestionId) {
        return sendSuccess(reply, 'Quiz selesai, lanjut ke game', {
          quizFinished: true,
          remainingSeconds: test.quizStartedAt
            ? calculateRemainingSeconds(test.quizStartedAt, test.quizDuration)
            : 0,
        });
      }

      const question = await questionRepository.findById(test.currentQuizQuestionId);
      if (!question) {
        throw new NotFoundError('Soal tidak ditemukan.');
      }

      const remainingSeconds = test.quizStartedAt
        ? calculateRemainingSeconds(test.quizStartedAt, test.quizDuration)
        : 0;

      return sendSuccess(reply, 'Soal quiz', { question, remainingSeconds, quizFinished: false });
    },
  );

  // POST /api/participant/quiz/:publicToken/answer
  fastify.post(
    '/quiz/:publicToken/answer',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      if (test.status !== 'Sedang Tes') {
        throw new ConflictError('Tes belum dimulai atau sudah selesai.');
      }

      if (test.quizStartedAt) {
        const remaining = calculateRemainingSeconds(test.quizStartedAt, test.quizDuration);
        if (remaining <= 0) {
          await participantTestRepository.finishTest(test.participantTestId, 'Waktu Habis');
          throw new ConflictError('Waktu tes habis.');
        }
      }

      const parsed = submitQuizAnswerSchema.safeParse(request.body);
      if (!parsed.success) {
        const errors: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as string;
          if (!errors[key]) errors[key] = [];
          errors[key].push(issue.message);
        }
        throw new ValidationError('Data tidak valid', errors);
      }

      if (!test.currentQuizQuestionId) {
        throw new ConflictError('Tidak ada soal yang sedang ditampilkan.');
      }

      const existingAnswer = await quizAnswerRepository.findByTestAndQuestion(
        test.participantTestId,
        test.currentQuizQuestionId,
      );
      if (existingAnswer) {
        throw new ConflictError('Soal ini sudah dijawab.');
      }

      await quizAnswerRepository.create({
        participantTestId: test.participantTestId,
        questionId: test.currentQuizQuestionId,
        questionOptionId: parsed.data.questionOptionId,
      });

      const allQuestions = await snapshotRepository.getQuizSnapshot();
      const currentIndex = allQuestions.findIndex(
        (q) => q.questionId === test.currentQuizQuestionId,
      );
      const nextQuestion =
        currentIndex >= 0 && currentIndex < allQuestions.length - 1
          ? allQuestions[currentIndex + 1]
          : null;

      if (nextQuestion) {
        await participantTestRepository.updateCurrentQuizQuestion(
          test.participantTestId,
          nextQuestion.questionId,
        );
        const question = await questionRepository.findById(nextQuestion.questionId);
        return sendSuccess(reply, 'Jawaban disimpan. Soal berikutnya.', {
          nextQuestion: question,
          quizFinished: false,
        });
      }

      await participantTestRepository.finishQuiz(test.participantTestId);
      const gameSnapshot = await snapshotRepository.getGameSnapshot();

      if (gameSnapshot.length > 0) {
        await participantTestRepository.startGame(test.participantTestId, gameSnapshot[0].gameId);
      }

      return sendSuccess(reply, 'Quiz selesai. Lanjut ke game.', {
        quizFinished: true,
        gameSnapshot: gameSnapshot.length > 0 ? gameSnapshot : null,
        currentGame: gameSnapshot[0] ?? null,
      });
    },
  );

  // GET /api/participant/game/:publicToken
  fastify.get(
    '/game/:publicToken',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      if (test.status !== 'Sedang Tes') {
        throw new ConflictError('Tes belum dimulai atau sudah selesai.');
      }

      if (!test.currentGameId) {
        await participantTestRepository.finishTest(test.participantTestId, 'Selesai');
        return sendSuccess(reply, 'Seluruh tes selesai', { testFinished: true });
      }

      const game = await gameRepository.findById(test.currentGameId);
      if (!game) {
        throw new NotFoundError('Game tidak ditemukan.');
      }

      const remainingSeconds = test.currentGameStartedAt
        ? calculateRemainingSeconds(test.currentGameStartedAt, game.duration)
        : game.duration;

      if (remainingSeconds <= 0) {
        await gameResultRepository.create({
          participantTestId: test.participantTestId,
          gameId: game.gameId,
          duration: game.duration,
          totalSteps: game.gameType === 'Image Sliding Puzzle' ? 0 : null,
          totalFoundWords: game.gameType === 'Search Word' ? 0 : null,
          status: 'Waktu Habis',
        });

        const gameSnapshot = await snapshotRepository.getGameSnapshot();
        const currentIndex = gameSnapshot.findIndex((g) => g.gameId === test.currentGameId);
        const nextGame =
          currentIndex >= 0 && currentIndex < gameSnapshot.length - 1
            ? gameSnapshot[currentIndex + 1]
            : null;

        if (nextGame) {
          await participantTestRepository.finishGame(test.participantTestId);
          await participantTestRepository.startGame(test.participantTestId, nextGame.gameId);
          const nextGameData = await gameRepository.findById(nextGame.gameId);
          return sendSuccess(reply, 'Waktu game habis. Lanjut ke game berikutnya.', {
            game: nextGameData,
            remainingSeconds: nextGameData?.duration ?? 0,
            gameFinished: false,
          });
        }

        await participantTestRepository.finishGame(test.participantTestId);
        await participantTestRepository.finishTest(test.participantTestId, 'Selesai');
        return sendSuccess(reply, 'Seluruh tes selesai', { testFinished: true });
      }

      return sendSuccess(reply, 'Game saat ini', { game, remainingSeconds, gameFinished: false });
    },
  );

  // POST /api/participant/game/:publicToken/result
  fastify.post(
    '/game/:publicToken/result',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      if (test.status !== 'Sedang Tes') {
        throw new ConflictError('Tes belum dimulai atau sudah selesai.');
      }

      const parsed = submitGameResultSchema.safeParse(request.body);
      if (!parsed.success) {
        const errors: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as string;
          if (!errors[key]) errors[key] = [];
          errors[key].push(issue.message);
        }
        throw new ValidationError('Data tidak valid', errors);
      }

      const data = parsed.data;
      const game = await gameRepository.findById(data.gameId);
      if (!game) {
        throw new NotFoundError('Game tidak ditemukan.');
      }

      const duration = test.currentGameStartedAt
        ? Math.min(
            game.duration,
            Math.floor((Date.now() - new Date(test.currentGameStartedAt).getTime()) / 1000),
          )
        : game.duration;

      await gameResultRepository.create({
        participantTestId: test.participantTestId,
        gameId: data.gameId,
        duration,
        totalSteps: data.totalSteps ?? null,
        totalFoundWords: data.totalFoundWords ?? null,
        status: data.status,
        foundWordItemIds: data.foundWordItemIds,
      });

      const gameSnapshot = await snapshotRepository.getGameSnapshot();
      const currentIndex = gameSnapshot.findIndex((g) => g.gameId === data.gameId);
      const nextGame =
        currentIndex >= 0 && currentIndex < gameSnapshot.length - 1
          ? gameSnapshot[currentIndex + 1]
          : null;

      if (nextGame) {
        await participantTestRepository.finishGame(test.participantTestId);
        await participantTestRepository.startGame(test.participantTestId, nextGame.gameId);
        const nextGameData = await gameRepository.findById(nextGame.gameId);
        return sendSuccess(reply, 'Game selesai. Lanjut ke game berikutnya.', {
          game: nextGameData,
          remainingSeconds: nextGameData?.duration ?? 0,
          gameFinished: false,
        });
      }

      await participantTestRepository.finishGame(test.participantTestId);
      await participantTestRepository.finishTest(test.participantTestId, 'Selesai');
      return sendSuccess(reply, 'Seluruh tes selesai', { testFinished: true });
    },
  );

  // GET /api/participant/finish/:publicToken
  fastify.get(
    '/finish/:publicToken',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tes tidak ditemukan.');
      }

      const setting = await settingRepository.get();
      const config = getConfig();
      const participant = await participantRepository.findById(test.participantId);

      const isTimeout = test.status === 'Waktu Habis';
      const content = isTimeout ? setting.timeoutContent : setting.successContent;

      return sendSuccess(reply, 'Tes selesai', {
        test,
        content,
        isTimeout,
        adminWhatsapp: config.adminWhatsapp,
        participant,
      });
    },
  );

  // POST /api/participant/finish/:publicToken/send-proof
  fastify.post(
    '/finish/:publicToken/send-proof',
    async (request: FastifyRequest<{ Params: { publicToken: string } }>, reply: FastifyReply) => {
      const { publicToken } = request.params;
      const test = await participantTestRepository.findByPublicToken(publicToken);

      if (!test) {
        throw new NotFoundError('Tautan tes tidak ditemukan atau sudah tidak aktif.');
      }
      if (test.status !== 'Selesai' && test.status !== 'Waktu Habis') {
        throw new ConflictError('Tes belum selesai. Bukti belum dapat dikirim.');
      }

      await participantTestRepository.invalidatePublicToken(test.participantTestId, publicToken);
      return sendSuccess(reply, 'Bukti tes telah dikirim. Tautan tes dinonaktifkan.');
    },
  );
}

export function participantAdminRoutes(fastify: FastifyInstance): void {
  // GET /api/admin/participants
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = paginationSchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ValidationError('Parameter tidak valid');
    }

    const params = parsed.data;
    const result = await participantRepository.list({
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });

    return sendList(
      reply,
      'Daftar participant',
      result.items,
      result.total,
      params.page,
      params.perPage,
    );
  });

  // GET /api/admin/participants/:id
  fastify.get(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const detail = await participantDetailRepository.get(id);

      if (!detail) {
        throw new NotFoundError('Participant tidak ditemukan.');
      }

      return sendSuccess(reply, 'Detail participant', detail);
    },
  );
}