import {z} from 'zod';

export const signInSchema = z.object({
    idetifier: z.string(),
    password: z.string(),
});