import { z } from 'zod';
import { insertHabitSchema, insertHabitLogSchema, habits, habitLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  habits: {
    list: {
      method: 'GET' as const,
      path: '/api/habits',
      input: z.object({ userId: z.coerce.number() }).optional(),
      responses: {
        200: z.array(z.custom<typeof habits.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/habits',
      input: insertHabitSchema,
      responses: {
        201: z.custom<typeof habits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/habits/:id',
      responses: {
        200: z.custom<typeof habits.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/habits/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    logs: {
      list: {
        method: 'GET' as const,
        path: '/api/habits/:id/logs',
        input: z.object({
          month: z.string().optional(), // YYYY-MM
        }).optional(),
        responses: {
          200: z.array(z.custom<typeof habitLogs.$inferSelect>()),
        },
      },
      update: {
        method: 'POST' as const,
        path: '/api/habits/:id/logs',
        input: insertHabitLogSchema.omit({ habitId: true }),
        responses: {
          200: z.custom<typeof habitLogs.$inferSelect>(),
          400: errorSchemas.validation,
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
