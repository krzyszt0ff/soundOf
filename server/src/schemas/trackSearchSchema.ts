import * as z from "zod";

export const trackSearchSchema = z.object({
    q: z.string().trim().min(1).max(100),
    limit: z.coerce.number().int().min(1).max(50).default(25),
    index: z.coerce.number().int().min(0).max(1000).default(0),
});