import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_SERVER_URL: z.string(),
});

const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
});

if (!parsed.success) {
    console.error("Environmental variables error!!!");
    console.error(parsed.error.format());
    throw new Error('Invalid environment variables');
}

export const env = parsed.data;