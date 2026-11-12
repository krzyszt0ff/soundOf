import * as z from 'zod';

export const profileSchema = z.object({
    display_name: z.string().trim().min(1).max(32).nullable(),
    avatar_url: z.url({ protocol: /^https?$/ }).nullable(),
    bio: z.string().trim().max(500).nullable(),
})

export const profileIdSchema = z.object({
    profile_id: z.union([z.literal("me"), z.uuid()]),
})

export const followParamsSchema = z.object({
    profile_id: z.uuid(),                                
});

export const followListQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
});

export const updateProfileSchema = profileSchema.partial();