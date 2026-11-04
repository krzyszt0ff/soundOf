import * as z from 'zod';

export const createPinSchema = z.object({
    deezer_track_id: z.coerce.number().int().positive(),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    description: z.string().trim().max(500).default(""),
});

export type CreatePinInput = z.infer<typeof createPinSchema>;
