/**
 * Admin Routes (Serverless)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { adminLoginSchema } from './schemas.js';
import { sendSuccess, sendError } from './response.js';
import { ValidationError, UnauthorizedError } from './errors.js';
import { adminRepository, settingRepository } from './repositories.js';
import { hashPassword, verifyPassword, createAdminCookieOptions, resetLoginAttempts } from './auth.js';
import { getConfig } from './config.js';

export function adminAuthRoutes(fastify: FastifyInstance): void {
  // POST /api/admin/login
  fastify.post('/login', async (request: FastifyReply) => {
    const parsed = adminLoginSchema.safeParse(request.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError('Data tidak valid', errors);
    }

    const { password } = parsed.data;
    const storedHash = await adminRepository.getPasswordHash();

    if (!storedHash || !(await verifyPassword(storedHash, password))) {
      resetLoginAttempts();
      return sendError(request, 'Password salah', 401);
    }

    resetLoginAttempts();
    const config = getConfig();
    const payload = { administratorId: '1' };
    
    const token = await (request as any).jwtSign(payload);
    const cookieOptions = createAdminCookieOptions();
    
    (request as any).reply.setCookie('admin_session', token, cookieOptions);
    
    return sendSuccess(request, 'Login berhasil', { administratorId: '1' });
  });

  // POST /api/admin/logout
  fastify.post('/logout', async (request: FastifyReply) => {
    (request as any).reply.clearCookie('admin_session');
    return sendSuccess(request, 'Logout berhasil');
  });

  // GET /api/admin/me
  fastify.get('/me', async (request: FastifyReply) => {
    const adminId = (request as any).user?.administratorId;
    if (!adminId) {
      throw new UnauthorizedError('Session tidak valid.');
    }
    return sendSuccess(request, 'Data admin', { administratorId: adminId });
  });
}

export function adminProtectedRoutes(fastify: FastifyInstance): void {
  // GET /api/admin/settings
  fastify.get('/settings', async (request: FastifyReply) => {
    const setting = await settingRepository.get();
    return sendSuccess(request, 'Pengaturan', setting);
  });

  // PATCH /api/admin/settings
  fastify.patch('/settings', async (request: FastifyRequest, reply: FastifyReply) => {
    const setting = await settingRepository.get();
    
    const updates: Record<string, unknown> = {};
    const body = request.body as Record<string, unknown>;
    
    if (body.quizDuration !== undefined) updates.quizDuration = Number(body.quizDuration);
    if (body.instructionContent !== undefined) updates.instructionContent = body.instructionContent;
    if (body.successContent !== undefined) updates.successContent = body.successContent;
    if (body.timeoutContent !== undefined) updates.timeoutContent = body.timeContent;
    if (body.maintenanceMode !== undefined) updates.maintenanceMode = Boolean(body.maintenanceMode);

    const updated = await settingRepository.update(updates);
    return sendSuccess(reply, 'Pengaturan diperbarui', updated);
  });

  // GET /api/admin/questions
  fastify.get('/questions', async (request: FastifyReply) => {
    const questions = await (await import('./repositories.js')).questionRepository.listActive();
    return sendSuccess(request, 'Daftar soal', questions);
  });

  // POST /api/admin/questions
  fastify.post('/questions', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown>;
    const question = await (await import('./repositories.js')).questionRepository.create({
      questionType: String(body.questionType),
      questionText: String(body.questionText ?? ''),
      imageUrl: body.imageUrl as string | null,
      options: (body.options as { optionText: string | null; imageUrl: string | null }[]) || [],
    });
    return sendSuccess(reply, 'Soal berhasil dibuat', question, 201);
  });

  // DELETE /api/admin/questions/:id
  fastify.delete('/questions/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await (await import('./repositories.js')).questionRepository.deactivate(request.params.id);
    return sendSuccess(reply, 'Soal berhasil dihapus');
  });

  // GET /api/admin/games
  fastify.get('/games', async (request: FastifyReply) => {
    const games = await (await import('./repositories.js')).gameRepository.listActive();
    return sendSuccess(request, 'Daftar game', games);
  });

  // POST /api/admin/games
  fastify.post('/games', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown>;
    const game = await (await import('./repositories.js')).gameRepository.create({
      gameType: String(body.gameType),
      title: String(body.title ?? ''),
      imageUrl: body.imageUrl as string | null,
      duration: Number(body.duration),
      searchWordItems: (body.searchWordItems as { word: string }[]) || [],
    });
    return sendSuccess(reply, 'Game berhasil dibuat', game, 201);
  });

  // DELETE /api/admin/games/:id
  fastify.delete('/games/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await (await import('./repositories.js')).gameRepository.deactivate(request.params.id);
    return sendSuccess(reply, 'Game berhasil dihapus');
  });

  // GET /api/admin/participants
  fastify.get('/participants', async (request: FastifyReply) => {
    const participants = await (await import('./repositories.js')).participantRepository.list({
      page: 1,
      perPage: 100,
    });
    return sendSuccess(request, 'Daftar participant', participants.items);
  });

  // GET /api/admin/participants/:id
  fastify.get('/participants/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const detail = await (await import('./repositories.js')).participantDetailRepository.get(request.params.id);
    if (!detail) {
      throw new NotFoundError('Participant tidak ditemukan.');
    }
    return sendSuccess(reply, 'Detail participant', detail);
  });
}