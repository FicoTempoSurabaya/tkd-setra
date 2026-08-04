/**
 * Game Routes (Serverless)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { gameRepository } from './repositories.js';
import { sendSuccess, sendList, sendError } from './response.js';
import { NotFoundError, ValidationError } from './errors.js';
import { createGameSchema } from './schemas.js';

export function gameRoutes(fastify: FastifyInstance): void {
  // GET /api/admin/games
  fastify.get('/', async (request: FastifyReply) => {
    const games = await gameRepository.listActive();
    return sendSuccess(request, 'Daftar game', games);
  });

  // GET /api/admin/games/all
  fastify.get('/all', async (request: FastifyReply) => {
    const query = request.query as { page?: string; perPage?: string; search?: string };
    const page = Number(query.page) || 1;
    const perPage = Number(query.perPage) || 10;
    const search = query.search;

    const result = await gameRepository.listAll({ page, perPage, search });
    return sendList(request, 'Daftar game', result.items, result.total, page, perPage);
  });

  // GET /api/admin/games/:id
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const game = await gameRepository.findById(request.params.id);
    if (!game) {
      throw new NotFoundError('Game tidak ditemukan.');
    }
    return sendSuccess(reply, 'Detail game', game);
  });

  // POST /api/admin/games
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = createGameSchema.safeParse(request.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError('Data tidak valid', errors);
    }

    const game = await gameRepository.create(parsed.data);
    return sendSuccess(reply, 'Game berhasil dibuat', game, 201);
  });

  // DELETE /api/admin/games/:id
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await gameRepository.deactivate(request.params.id);
    return sendSuccess(reply, 'Game berhasil dihapus');
  });
}