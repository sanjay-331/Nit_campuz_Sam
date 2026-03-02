import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required').email('Not a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
