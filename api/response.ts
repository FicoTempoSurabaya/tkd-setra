/**
 * Response Helpers
 */

import type { FastifyReply } from 'fastify';
import type { ApiResponse, ApiListResponse } from './types.js';

export function sendSuccess<T>(
  reply: FastifyReply,
  message: string,
  data?: T,
  statusCode: number = 200,
): FastifyReply {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return reply.code(statusCode).send(response);
}

export function sendList<T>(
  reply: FastifyReply,
  message: string,
  items: T[],
  total: number,
  page: number,
  perPage: number,
): FastifyReply {
  const response: ApiListResponse<T> = {
    success: true,
    message,
    data: {
      items,
      total,
      page,
      perPage,
    },
  };
  return reply.code(200).send(response);
}

export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode: number = 400,
  errors?: Record<string, string[]>,
): FastifyReply {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return reply.code(statusCode).send(response);
}