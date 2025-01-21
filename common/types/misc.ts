import { z } from 'zod';

export const roomIdSchema = z.number().int().min(0);
export const usernameSchema = z.string();
