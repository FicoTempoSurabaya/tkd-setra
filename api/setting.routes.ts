/**
 * Setting Routes (Serverless)
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { settingRepository } from './repositories.js';
import { sendSuccess, sendError } from './response.js';
import { ValidationError } from './errors.js';
import { updateSettingSchema } from './schemas.js';

export function settingRoutes(fastify: FastifyInstance): void {
  // GET /api/admin/settings
  fastify.get('/', async (request: FastifyReply) => {
    const setting = await settingRepository.get();
    return sendSuccess(request, 'Pengaturan', setting);
  });

  // PATCH /api/admin/settings
  fastify.patch('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = updateSettingSchema.safeParse(request.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      throw new ValidationError('Data tidak valid', errors);
    }

    const updated = await settingRepository.update(parsed.data);
    return sendSuccess(reply, 'Pengaturan diperbarui', updated);
  });
}