import * as z from 'zod';

export const profileSchema = z.object({
    display_name: z.string().trim().min(1).max(32).nullable(),
    avatar_url: z.url({ protocol: /^https?$/ }).nullable(),
    bio: z.string().trim().max(500).nullable(),
})

export const updateProfileSchema = profileSchema.partial();