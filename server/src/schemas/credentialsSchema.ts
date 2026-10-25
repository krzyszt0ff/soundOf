import * as z from 'zod';

export const credentialsSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    username: z.string().nonempty()
    .min(3, 'Username cannot be shorter than 3 characters!')
    .max(32, 'Username cannot be longer than 32 characters!')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores!'),
    password: z.string()
        .min(8, 'Password needs to be at least 8 characters long!')
        .max(72, 'Password cannot be longer than 72 characters!')
})