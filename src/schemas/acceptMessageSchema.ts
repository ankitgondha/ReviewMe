import {z} from 'zod';

export const acceptSchema = z.object({
    accept: z.boolean(),
});