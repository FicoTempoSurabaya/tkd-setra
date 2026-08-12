 /**
 * Question Routes (Serverless)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { questionRepository } from './repositories.js';
import { sendSuccess, sendList } from './response.js';
import { NotFoundError, ValidationError } from './errors.js';
import { createQuestionSchema } from './schemas.js';

export function questionRoutes(fastify: FastifyInstance): void {
  // GET /api/admin/questions
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const questions = await questionRepository.listActive();
    return sendSuccess(reply, 'Daftar soal', questions);
  });

  // GET /api/admin/questions/all
  fastify.get('/all', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { page?: string; perPage?: string; search?: string };
    const page = Number(query.page) || 1;
    const perPage = Number(query.perPage) || 10;
    const search = query.search;

    const result = await questionRepository.listAll({ page, perPage, search });
    return sendList(reply, 'Daftar soal', result.items, result.total, page, perPage);
  });

  // GET /api/admin/questions/:id
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const question = await questionRepository.findById(request.params.id);
    if (!question) {
      throw new NotFoundError('Soal tidak ditemukan.');
    }
    return sendSuccess(reply, 'Detail soal', question);
  });

  // POST /api/admin/questions
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = createQuestionSchema.safeParse(request.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError('Data tidak valid', errors);
    }

const question = await questionRepository.create({
      questionType: parsed.data.questionType,
      questionText: parsed.data.questionText ?? '',
      imageUrl: parsed.data.imageUrl ?? null,
      options: parsed.data.options.map((o) => ({
        optionText: o.optionText ?? null,
        imageUrl: o.imageUrl ?? null,
      })),
    });
    return sendSuccess(reply, 'Soal berhasil dibuat', question, 201);
  });

  // DELETE /api/admin/questions/:id
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await questionRepository.deactivate(request.params.id);
    return sendSuccess(reply, 'Soal berhasil dihapus');
  });
}