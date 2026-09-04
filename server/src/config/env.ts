// validating .env values
// so that I don't have to parse them every time I use them :p

import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Environmental variables error!!!");
    console.error(parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;