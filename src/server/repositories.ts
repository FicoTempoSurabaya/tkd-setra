/**
 * Database Repositories (Serverless)
 * Inlined from apps/backend/src/db/repositories.ts
 */

import type { PoolClient } from 'pg';
import { query, withTransaction, getClient } from './db.js';
import {
  generatePublicToken,
  normalizeWhatsapp,
} from './utils.js';
import type {
  Participant,
  ParticipantTest,
  Question,
  QuestionOption,
  Game,
  SearchWordItem,
  QuizAnswer,
  GameResult,
  Setting,
  ParticipantDetail,
  SnapshotQuestion,
  SnapshotGame,
  SnapshotOption,
} from './types.js';

// ============================================================
// ADMINISTRATOR REPOSITORY
// ============================================================
export const adminRepository = {
  async getPasswordHash(): Promise<string | null> {
    const result = await query<{ password_hash: string }>(
      'SELECT password_hash FROM administrator WHERE administrator_id = 1',
    );
    return result.rows[0]?.password_hash ?? null;
  },

  async updatePasswordHash(hash: string): Promise<void> {
    await query(
      'UPDATE administrator SET password_hash = $1, updated_at = NOW() WHERE administrator_id = 1',
      [hash],
    );
  },
};

// ============================================================
// PARTICIPANT REPOSITORY
// ============================================================
export const participantRepository = {
  async create(
    data: {
      fullName: string;
      birthPlace: string;
      birthDate: string;
      nik: string;
      address: string;
      whatsapp: string;
      email: string;
    },
    client?: PoolClient,
  ): Promise<Participant> {
    const whatsapp = normalizeWhatsapp(data.whatsapp);
    const exec = client ?? (await getClient());
    const result = await exec.query(
      `INSERT INTO participant (full_name, birth_place, birth_date, nik, address, whatsapp, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.fullName, data.birthPlace, data.birthDate, data.nik, data.address, whatsapp, data.email],
    );
    if (!client) exec.release();
    return mapParticipant(result.rows[0]);
  },

  async findByNik(nik: string): Promise<Participant | null> {
    const result = await query('SELECT * FROM participant WHERE nik = $1', [nik]);
    return result.rows[0] ? mapParticipant(result.rows[0]) : null;
  },

  async findByEmail(email: string): Promise<Participant | null> {
    const result = await query('SELECT * FROM participant WHERE email = $1', [email]);
    return result.rows[0] ? mapParticipant(result.rows[0]) : null;
  },

  async findById(id: string): Promise<Participant | null> {
    const result = await query('SELECT * FROM participant WHERE participant_id = $1', [id]);
    return result.rows[0] ? mapParticipant(result.rows[0]) : null;
  },

  async list(params: {
    page: number;
    perPage: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ items: Participant[]; total: number }> {
    const { page, perPage, search, sortBy, sortOrder } = params;
    const offset = (page - 1) * perPage;

    const allowedSortColumns: Record<string, string> = {
      fullName: 'full_name',
      nik: 'nik',
      birthDate: 'birth_date',
      birthPlace: 'birth_place',
      whatsapp: 'whatsapp',
      email: 'email',
      createdAt: 'created_at',
    };
    const sortColumn = (sortBy && allowedSortColumns[sortBy]) || 'created_at';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let whereClause = '';
    const paramsArr: unknown[] = [];
    if (search) {
      whereClause = 'WHERE full_name ILIKE $1 OR nik ILIKE $1 OR email ILIKE $1';
      paramsArr.push(`%${search}%`);
    }

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM participant ${whereClause}`,
      paramsArr,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT * FROM participant ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramsArr.length + 1} OFFSET $${paramsArr.length + 2}`,
      [...paramsArr, perPage, offset],
    );

    return { items: result.rows.map(mapParticipant), total };
  },
};

// ============================================================
// PARTICIPANT TEST REPOSITORY
// ============================================================
export const participantTestRepository = {
  async create(
    data: { participantId: string; quizDuration: number },
    client?: PoolClient,
  ): Promise<ParticipantTest> {
    const publicToken = generatePublicToken();
    const exec = client ?? (await getClient());
    const result = await exec.query(
      `INSERT INTO participant_test (participant_id, public_token, status, quiz_duration)
       VALUES ($1, $2, 'Belum Mulai', $3)
       RETURNING *`,
      [data.participantId, publicToken, data.quizDuration],
    );
    if (!client) exec.release();
    return mapParticipantTest(result.rows[0]);
  },

  async findByPublicToken(token: string): Promise<ParticipantTest | null> {
    const result = await query('SELECT * FROM participant_test WHERE public_token = $1', [token]);
    return result.rows[0] ? mapParticipantTest(result.rows[0]) : null;
  },

  async findById(id: string): Promise<ParticipantTest | null> {
    const result = await query(
      'SELECT * FROM participant_test WHERE participant_test_id = $1',
      [id],
    );
    return result.rows[0] ? mapParticipantTest(result.rows[0]) : null;
  },

  async findByParticipantId(participantId: string): Promise<ParticipantTest | null> {
    const result = await query(
      'SELECT * FROM participant_test WHERE participant_id = $1 ORDER BY created_at DESC LIMIT 1',
      [participantId],
    );
    return result.rows[0] ? mapParticipantTest(result.rows[0]) : null;
  },

  async startTest(testId: string): Promise<ParticipantTest> {
    const result = await query(
      `UPDATE participant_test
       SET status = 'Sedang Tes', test_started_at = NOW(), quiz_started_at = NOW(), updated_at = NOW()
       WHERE participant_test_id = $1
       RETURNING *`,
      [testId],
    );
    return mapParticipantTest(result.rows[0]);
  },

  async updateCurrentQuizQuestion(testId: string, questionId: string | null): Promise<void> {
    await query(
      'UPDATE participant_test SET current_quiz_question_id = $1, updated_at = NOW() WHERE participant_test_id = $2',
      [questionId, testId],
    );
  },

  async finishQuiz(testId: string): Promise<void> {
    await query(
      `UPDATE participant_test
       SET quiz_finished_at = NOW(), current_quiz_question_id = NULL, updated_at = NOW()
       WHERE participant_test_id = $1`,
      [testId],
    );
  },

  async startGame(testId: string, gameId: string): Promise<void> {
    await query(
      `UPDATE participant_test
       SET current_game_id = $1, current_game_started_at = NOW(), updated_at = NOW()
       WHERE participant_test_id = $2`,
      [gameId, testId],
    );
  },

  async finishGame(testId: string): Promise<void> {
    await query(
      `UPDATE participant_test
       SET current_game_id = NULL, current_game_started_at = NULL, updated_at = NOW()
       WHERE participant_test_id = $1`,
      [testId],
    );
  },

  async finishTest(testId: string, status: 'Selesai' | 'Waktu Habis'): Promise<void> {
    await query(
      `UPDATE participant_test
       SET status = $1, test_finished_at = NOW(), current_quiz_question_id = NULL,
           current_game_id = NULL, current_game_started_at = NULL, updated_at = NOW()
       WHERE participant_test_id = $2`,
      [status, testId],
    );
  },

  async invalidatePublicToken(testId: string, publicToken: string): Promise<void> {
    await query(
      `UPDATE participant_test
       SET public_token = $1, updated_at = NOW()
       WHERE participant_test_id = $2`,
      [`used-${publicToken}-${testId}`, testId],
    );
  },
};

// ============================================================
// QUESTION REPOSITORY
// ============================================================
export const questionRepository = {
  async create(
    data: {
      questionType: string;
      questionText: string;
      imageUrl: string | null;
      options: { optionText: string | null; imageUrl: string | null }[];
    },
  ): Promise<Question> {
    return withTransaction(async (client) => {
      const orderResult = await client.query<{ max_order: number | null }>(
        'SELECT MAX(question_order) as max_order FROM question',
      );
      const nextOrder = (orderResult.rows[0].max_order ?? 0) + 1;

      const result = await client.query(
        `INSERT INTO question (question_type, question_order, question_text, image_url, status)
         VALUES ($1, $2, $3, $4, 'Aktif')
         RETURNING *`,
        [data.questionType, nextOrder, data.questionText, data.imageUrl],
      );
      const question = result.rows[0];

      for (let i = 0; i < data.options.length; i++) {
        const opt = data.options[i];
        await client.query(
          `INSERT INTO question_option (question_id, option_order, option_text, image_url, is_correct)
           VALUES ($1, $2, $3, $4, false)`,
          [question.question_id, i + 1, opt.optionText, opt.imageUrl],
        );
      }

      const fullQuestion = await this.findById(String(question.question_id), client);
      return fullQuestion!;
    });
  },

  async findById(id: string, client?: PoolClient): Promise<Question | null> {
    const exec = client ?? (await getClient());
    const result = await exec.query('SELECT * FROM question WHERE question_id = $1', [id]);
    if (!result.rows[0]) {
      if (!client) exec.release();
      return null;
    }
    const optionsResult = await exec.query(
      'SELECT * FROM question_option WHERE question_id = $1 ORDER BY option_order ASC',
      [id],
    );
    if (!client) exec.release();
    return {
      ...mapQuestion(result.rows[0]),
      options: optionsResult.rows.map(mapQuestionOption),
    };
  },

  async listActive(): Promise<Question[]> {
    // Single JOIN query instead of N+1 sequential queries
    const result = await query(
      `SELECT
         q.*,
         qo.question_option_id,
         qo.option_order,
         qo.option_text,
         qo.image_url AS option_image_url,
         qo.is_correct,
         qo.created_at AS option_created_at,
         qo.updated_at AS option_updated_at
       FROM question q
       LEFT JOIN question_option qo ON qo.question_id = q.question_id
       WHERE q.status = $1
       ORDER BY q.question_order ASC, qo.option_order ASC`,
      ['Aktif'],
    );
    // Group rows by question
    const questionsMap = new Map<string, Question>();
    for (const row of result.rows) {
      const qid = String(row.question_id);
      if (!questionsMap.has(qid)) {
        questionsMap.set(qid, { ...mapQuestion(row), options: [] });
      }
      if (row.question_option_id) {
        questionsMap.get(qid)!.options.push(
          mapQuestionOption({
            question_option_id: row.question_option_id,
            question_id: row.question_id,
            option_order: row.option_order,
            option_text: row.option_text,
            image_url: row.option_image_url,
            is_correct: row.is_correct,
            created_at: row.option_created_at,
            updated_at: row.option_updated_at,
          }),
        );
      }
    }
    return Array.from(questionsMap.values());
  },

  async listAll(params: {
    page: number;
    perPage: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ items: Question[]; total: number }> {
    const { page, perPage, search, sortBy, sortOrder } = params;
    const offset = (page - 1) * perPage;

    const allowedSortColumns: Record<string, string> = {
      questionType: 'question_type',
      questionOrder: 'question_order',
      questionText: 'question_text',
      status: 'status',
      createdAt: 'created_at',
    };
    const sortColumn = (sortBy && allowedSortColumns[sortBy]) || 'question_order';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let whereClause = "WHERE status = 'Aktif'";
    const paramsArr: unknown[] = [];
    if (search) {
      whereClause += ' AND (question_text ILIKE $1 OR question_type ILIKE $1)';
      paramsArr.push(`%${search}%`);
    }

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM question ${whereClause}`,
      paramsArr,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT * FROM question ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramsArr.length + 1} OFFSET $${paramsArr.length + 2}`,
      [...paramsArr, perPage, offset],
    );

    const questions: Question[] = [];
    for (const row of result.rows) {
      const optionsResult = await query(
        'SELECT * FROM question_option WHERE question_id = $1 ORDER BY option_order ASC',
        [row.question_id],
      );
      questions.push({
        ...mapQuestion(row),
        options: optionsResult.rows.map(mapQuestionOption),
      });
    }

    return { items: questions, total };
  },

  async deactivate(id: string): Promise<void> {
    await query(
      "UPDATE question SET status = 'Non Aktif', updated_at = NOW() WHERE question_id = $1",
      [id],
    );
  },
};

// ============================================================
// GAME REPOSITORY
// ============================================================
export const gameRepository = {
  async create(
    data: {
      gameType: string;
      title: string;
      imageUrl: string | null;
      duration: number;
      searchWordItems?: { word: string }[];
    },
  ): Promise<Game> {
    return withTransaction(async (client) => {
      const orderResult = await client.query<{ max_order: number | null }>(
        'SELECT MAX(game_order) as max_order FROM game',
      );
      const nextOrder = (orderResult.rows[0].max_order ?? 0) + 1;

      const result = await client.query(
        `INSERT INTO game (game_type, game_order, title, image_url, duration, status)
         VALUES ($1, $2, $3, $4, $5, 'Aktif')
         RETURNING *`,
        [data.gameType, nextOrder, data.title, data.imageUrl, data.duration],
      );
      const game = result.rows[0];

      if (data.gameType === 'Search Word' && data.searchWordItems) {
        for (let i = 0; i < data.searchWordItems.length; i++) {
          await client.query(
            `INSERT INTO search_word_item (game_id, word_order, word)
             VALUES ($1, $2, $3)`,
            [game.game_id, i + 1, data.searchWordItems[i].word],
          );
        }
      }

      const fullGame = await this.findById(String(game.game_id), client);
      return fullGame!;
    });
  },

  async findById(id: string, client?: PoolClient): Promise<Game | null> {
    const exec = client ?? (await getClient());
    const result = await exec.query('SELECT * FROM game WHERE game_id = $1', [id]);
    if (!result.rows[0]) {
      if (!client) exec.release();
      return null;
    }
    const itemsResult = await exec.query(
      'SELECT * FROM search_word_item WHERE game_id = $1 ORDER BY word_order ASC',
      [id],
    );
    if (!client) exec.release();
    return {
      ...mapGame(result.rows[0]),
      searchWordItems: itemsResult.rows.map(mapSearchWordItem),
    };
  },

  async listActive(): Promise<Game[]> {
    // Single JOIN query instead of N+1 sequential queries
    const result = await query(
      `SELECT
         g.*,
         swi.search_word_item_id,
         swi.word,
         swi.word_order,
         swi.created_at AS item_created_at,
         swi.updated_at AS item_updated_at
       FROM game g
       LEFT JOIN search_word_item swi ON swi.game_id = g.game_id
       WHERE g.status = $1
       ORDER BY g.game_order ASC, swi.word_order ASC`,
      ['Aktif'],
    );
    // Group rows by game
    const gamesMap = new Map<string, Game>();
    for (const row of result.rows) {
      const gid = String(row.game_id);
      if (!gamesMap.has(gid)) {
        gamesMap.set(gid, { ...mapGame(row), searchWordItems: [] });
      }
      if (row.search_word_item_id) {
        gamesMap.get(gid)!.searchWordItems.push(
          mapSearchWordItem({
            search_word_item_id: row.search_word_item_id,
            game_id: row.game_id,
            word: row.word,
            word_order: row.word_order,
            created_at: row.item_created_at,
            updated_at: row.item_updated_at,
          }),
        );
      }
    }
    return Array.from(gamesMap.values());
  },

  async listAll(params: {
    page: number;
    perPage: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ items: Game[]; total: number }> {
    const { page, perPage, search, sortBy, sortOrder } = params;
    const offset = (page - 1) * perPage;

    const allowedSortColumns: Record<string, string> = {
      gameType: 'game_type',
      gameOrder: 'game_order',
      title: 'title',
      status: 'status',
      createdAt: 'created_at',
    };
    const sortColumn = (sortBy && allowedSortColumns[sortBy]) || 'game_order';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    let whereClause = "WHERE status = 'Aktif'";
    const paramsArr: unknown[] = [];
    if (search) {
      whereClause += ' AND (title ILIKE $1 OR game_type ILIKE $1)';
      paramsArr.push(`%${search}%`);
    }

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM game ${whereClause}`,
      paramsArr,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT * FROM game ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramsArr.length + 1} OFFSET $${paramsArr.length + 2}`,
      [...paramsArr, perPage, offset],
    );

    const games: Game[] = [];
    for (const row of result.rows) {
      const itemsResult = await query(
        'SELECT * FROM search_word_item WHERE game_id = $1 ORDER BY word_order ASC',
        [row.game_id],
      );
      games.push({
        ...mapGame(row),
        searchWordItems: itemsResult.rows.map(mapSearchWordItem),
      });
    }

    return { items: games, total };
  },

  async deactivate(id: string): Promise<void> {
    await query(
      "UPDATE game SET status = 'Non Aktif', updated_at = NOW() WHERE game_id = $1",
      [id],
    );
  },
};

// ============================================================
// QUIZ ANSWER REPOSITORY
// ============================================================
export const quizAnswerRepository = {
  async create(
    data: { participantTestId: string; questionId: string; questionOptionId: string },
    client?: PoolClient,
  ): Promise<QuizAnswer> {
    const exec = client ?? (await getClient());
    const result = await exec.query(
      `INSERT INTO quiz_answer (participant_test_id, question_id, question_option_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.participantTestId, data.questionId, data.questionOptionId],
    );
    if (!client) exec.release();
    return mapQuizAnswer(result.rows[0]);
  },

  async findByTest(testId: string): Promise<QuizAnswer[]> {
    const result = await query(
      'SELECT * FROM quiz_answer WHERE participant_test_id = $1 ORDER BY answered_at ASC',
      [testId],
    );
    return result.rows.map(mapQuizAnswer);
  },

  async findByTestAndQuestion(
    testId: string,
    questionId: string,
  ): Promise<QuizAnswer | null> {
    const result = await query(
      'SELECT * FROM quiz_answer WHERE participant_test_id = $1 AND question_id = $2',
      [testId, questionId],
    );
    return result.rows[0] ? mapQuizAnswer(result.rows[0]) : null;
  },
};

// ============================================================
// GAME RESULT REPOSITORY
// ============================================================
export const gameResultRepository = {
  async create(
    data: {
      participantTestId: string;
      gameId: string;
      duration: number;
      totalSteps: number | null;
      totalFoundWords: number | null;
      status: string;
      foundWordItemIds?: string[];
    },
  ): Promise<GameResult> {
    return withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO game_result (participant_test_id, game_id, duration, total_steps, total_found_words, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          data.participantTestId,
          data.gameId,
          data.duration,
          data.totalSteps,
          data.totalFoundWords,
          data.status,
        ],
      );
      const gameResult = result.rows[0];

      if (data.foundWordItemIds && data.foundWordItemIds.length > 0) {
        for (const itemId of data.foundWordItemIds) {
          await client.query(
            `INSERT INTO search_word_found (game_result_id, search_word_item_id)
             VALUES ($1, $2)`,
            [gameResult.game_result_id, itemId],
          );
        }
      }

      const fullResult = await this.findById(String(gameResult.game_result_id), client);
      return fullResult!;
    });
  },

  async findById(id: string, client?: PoolClient): Promise<GameResult | null> {
    const exec = client ?? (await getClient());
    const result = await exec.query('SELECT * FROM game_result WHERE game_result_id = $1', [id]);
    if (!result.rows[0]) {
      if (!client) exec.release();
      return null;
    }
    const foundResult = await exec.query(
      'SELECT * FROM search_word_found WHERE game_result_id = $1',
      [id],
    );
    if (!client) exec.release();
    return {
      ...mapGameResult(result.rows[0]),
      searchWordFound: foundResult.rows.map((r) => ({
        searchWordFoundId: String(r.search_word_found_id),
        gameResultId: String(r.game_result_id),
        searchWordItemId: String(r.search_word_item_id),
        foundAt: r.found_at.toISOString(),
        createdAt: r.created_at.toISOString(),
      })),
    };
  },

  async findByTest(testId: string): Promise<GameResult[]> {
    const result = await query(
      'SELECT * FROM game_result WHERE participant_test_id = $1 ORDER BY created_at ASC',
      [testId],
    );
    const gameResults: GameResult[] = [];
    for (const row of result.rows) {
      const foundResult = await query(
        'SELECT * FROM search_word_found WHERE game_result_id = $1',
        [row.game_result_id],
      );
      gameResults.push({
        ...mapGameResult(row),
        searchWordFound: foundResult.rows.map((r) => ({
          searchWordFoundId: String(r.search_word_found_id),
          gameResultId: String(r.game_result_id),
          searchWordItemId: String(r.search_word_item_id),
          foundAt: r.found_at.toISOString(),
          createdAt: r.created_at.toISOString(),
        })),
      });
    }
    return gameResults;
  },
};

// ============================================================
// SETTING REPOSITORY
// ============================================================
export const settingRepository = {
  async get(): Promise<Setting> {
    const result = await query('SELECT * FROM setting LIMIT 1');
    return mapSetting(result.rows[0]);
  },

  async update(data: {
    quizDuration?: number;
    instructionContent?: unknown;
    successContent?: unknown;
    timeoutContent?: unknown;
    maintenanceMode?: boolean;
  }): Promise<Setting> {
    const sets: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (data.quizDuration !== undefined) {
      sets.push(`quiz_duration = $${paramIdx++}`);
      params.push(data.quizDuration);
    }
    if (data.instructionContent !== undefined) {
      sets.push(`instruction_content = $${paramIdx++}`);
      params.push(JSON.stringify(data.instructionContent));
    }
    if (data.successContent !== undefined) {
      sets.push(`success_content = $${paramIdx++}`);
      params.push(JSON.stringify(data.successContent));
    }
    if (data.timeoutContent !== undefined) {
      sets.push(`timeout_content = $${paramIdx++}`);
      params.push(JSON.stringify(data.timeoutContent));
    }
    if (data.maintenanceMode !== undefined) {
      sets.push(`maintenance_mode = $${paramIdx++}`);
      params.push(data.maintenanceMode);
    }

    if (sets.length === 0) {
      return this.get();
    }

    sets.push('updated_at = NOW()');
    params.push('1');

    const result = await query(
      `UPDATE setting SET ${sets.join(', ')} WHERE setting_id = $${paramIdx} RETURNING *`,
      params,
    );
    return mapSetting(result.rows[0]);
  },
};

// ============================================================
// PARTICIPANT DETAIL REPOSITORY (composite)
// ============================================================
export const participantDetailRepository = {
  async get(participantId: string): Promise<ParticipantDetail | null> {
    const participant = await participantRepository.findById(participantId);
    if (!participant) return null;

    const test = await participantTestRepository.findByParticipantId(participantId);

    let quizAnswers: ParticipantDetail['quizAnswers'] = [];
    let gameResults: ParticipantDetail['gameResults'] = [];

    if (test) {
      const answers = await quizAnswerRepository.findByTest(test.participantTestId);
      quizAnswers = await Promise.all(
        answers.map(async (a) => {
          const qResult = await query(
            'SELECT question_text, question_type, question_order FROM question WHERE question_id = $1',
            [a.questionId],
          );
          const oResult = await query(
            'SELECT option_text, image_url FROM question_option WHERE question_option_id = $1',
            [a.questionOptionId],
          );
          const q = qResult.rows[0];
          const o = oResult.rows[0];
          return {
            questionText: q.question_text,
            questionType: q.question_type,
            questionOrder: q.question_order,
            selectedOptionText: o?.option_text ?? null,
            selectedOptionImageUrl: o?.image_url ?? null,
            answeredAt: a.answeredAt,
          };
        }),
      );

      const results = await gameResultRepository.findByTest(test.participantTestId);
      gameResults = await Promise.all(
        results.map(async (r) => {
          const gResult = await query(
            'SELECT game_type, title, game_order FROM game WHERE game_id = $1',
            [r.gameId],
          );
          const g = gResult.rows[0];

          let foundWords: string[] = [];
          if (r.searchWordFound.length > 0) {
            const itemIds = r.searchWordFound.map((f: { searchWordItemId: string }) => f.searchWordItemId);
            const wordsResult = await query(
              `SELECT word FROM search_word_item WHERE search_word_item_id = ANY($1::bigint[])`,
              [itemIds],
            );
            foundWords = wordsResult.rows.map((row) => row.word);
          }

          return {
            gameType: g.game_type,
            gameTitle: g.title,
            gameOrder: g.game_order,
            status: r.status,
            duration: r.duration,
            totalSteps: r.totalSteps,
            totalFoundWords: r.totalFoundWords,
            foundWords,
          };
        }),
      );
    }

    return { biodata: participant, test, quizAnswers, gameResults };
  },
};

// ============================================================
// SNAPSHOT REPOSITORY
// ============================================================
export const snapshotRepository = {
  async getQuizSnapshot(): Promise<SnapshotQuestion[]> {
    const questions = await questionRepository.listActive();
    return questions.map((q) => ({
      questionId: q.questionId,
      questionType: q.questionType,
      questionOrder: q.questionOrder,
      questionText: q.questionText,
      imageUrl: q.imageUrl,
      options: q.options.map(
        (o: QuestionOption): SnapshotOption => ({
          questionOptionId: o.questionOptionId,
          optionOrder: o.optionOrder,
          optionText: o.optionText,
          imageUrl: o.imageUrl,
        }),
      ),
    }));
  },

  async getGameSnapshot(): Promise<SnapshotGame[]> {
    const games = await gameRepository.listActive();
    return games.map((g) => ({
      gameId: g.gameId,
      gameType: g.gameType,
      gameOrder: g.gameOrder,
      title: g.title,
      imageUrl: g.imageUrl,
      duration: g.duration,
      searchWordItems: g.searchWordItems.map((item: SearchWordItem) => ({
        word: item.word,
        searchWordItemId: item.searchWordItemId,
      })),
    }));
  },
};

// ============================================================
// MAPPING FUNCTIONS
// ============================================================
function mapParticipant(row: Record<string, unknown>): Participant {
  return {
    participantId: String(row.participant_id),
    fullName: String(row.full_name),
    birthPlace: String(row.birth_place),
    birthDate: (row.birth_date as Date).toISOString().split('T')[0],
    nik: String(row.nik),
    address: String(row.address),
    whatsapp: String(row.whatsapp),
    email: String(row.email),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapParticipantTest(row: Record<string, unknown>): ParticipantTest {
  return {
    participantTestId: String(row.participant_test_id),
    participantId: String(row.participant_id),
    publicToken: String(row.public_token),
    status: row.status as ParticipantTest['status'],
    quizDuration: Number(row.quiz_duration),
    quizStartedAt: row.quiz_started_at ? (row.quiz_started_at as Date).toISOString() : null,
    quizFinishedAt: row.quiz_finished_at ? (row.quiz_finished_at as Date).toISOString() : null,
    currentQuizQuestionId: row.current_quiz_question_id
      ? String(row.current_quiz_question_id)
      : null,
    currentGameId: row.current_game_id ? String(row.current_game_id) : null,
    currentGameStartedAt: row.current_game_started_at
      ? (row.current_game_started_at as Date).toISOString()
      : null,
    testStartedAt: row.test_started_at ? (row.test_started_at as Date).toISOString() : null,
    testFinishedAt: row.test_finished_at ? (row.test_finished_at as Date).toISOString() : null,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapQuestion(row: Record<string, unknown>): Omit<Question, 'options'> {
  return {
    questionId: String(row.question_id),
    questionType: row.question_type as Question['questionType'],
    questionOrder: Number(row.question_order),
    questionText: String(row.question_text),
    imageUrl: row.image_url ? String(row.image_url) : null,
    status: row.status as Question['status'],
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapQuestionOption(row: Record<string, unknown>): QuestionOption {
  return {
    questionOptionId: String(row.question_option_id),
    questionId: String(row.question_id),
    optionOrder: Number(row.option_order),
    optionText: row.option_text ? String(row.option_text) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    isCorrect: Boolean(row.is_correct),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapGame(row: Record<string, unknown>): Omit<Game, 'searchWordItems'> {
  return {
    gameId: String(row.game_id),
    gameType: row.game_type as Game['gameType'],
    gameOrder: Number(row.game_order),
    title: String(row.title),
    imageUrl: row.image_url ? String(row.image_url) : null,
    duration: Number(row.duration),
    status: row.status as Game['status'],
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapSearchWordItem(row: Record<string, unknown>): SearchWordItem {
  return {
    searchWordItemId: String(row.search_word_item_id),
    gameId: String(row.game_id),
    wordOrder: Number(row.word_order),
    word: String(row.word),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapQuizAnswer(row: Record<string, unknown>): QuizAnswer {
  return {
    quizAnswerId: String(row.quiz_answer_id),
    participantTestId: String(row.participant_test_id),
    questionId: String(row.question_id),
    questionOptionId: String(row.question_option_id),
    answeredAt: (row.answered_at as Date).toISOString(),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapGameResult(row: Record<string, unknown>): Omit<GameResult, 'searchWordFound'> {
  return {
    gameResultId: String(row.game_result_id),
    participantTestId: String(row.participant_test_id),
    gameId: String(row.game_id),
    duration: Number(row.duration),
    totalSteps: row.total_steps !== null ? Number(row.total_steps) : null,
    totalFoundWords: row.total_found_words !== null ? Number(row.total_found_words) : null,
    status: row.status as GameResult['status'],
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapSetting(row: Record<string, unknown>): Setting {
  return {
    settingId: String(row.setting_id),
    quizDuration: Number(row.quiz_duration),
    instructionContent: row.instruction_content,
    successContent: row.success_content,
    timeoutContent: row.timeout_content,
    maintenanceMode: Boolean(row.maintenance_mode),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}