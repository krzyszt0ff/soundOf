import * as z from 'zod';

export const nearbyPinSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
    // radius in meters, from 1m to 100 km, default at 2 km
    radius: z.coerce.number().int().min(1).max(100_000).default(2_000),
    // max number of pins returned
    limit: z.coerce.number().int().min(1).max(200).default(100),
});