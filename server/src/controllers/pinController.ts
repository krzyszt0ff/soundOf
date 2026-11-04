import { Request, Response } from "express";
import * as z from 'zod';
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { createPinSchema } from "../schemas/createPinSchema.js";
import { nearbyPinSchema } from "../schemas/nearbyPinSchema.js";
import { ensureTrackFromDeezer } from "../services/trackService.js";
import { DeezerError } from "../services/deezerService.js";

const pinSelect = {
    id: true,
    lat: true,
    lon: true,
    description: true,
    publish_date: true,
    user: { select: { id: true, display_name: true, avatar_url: true } },
    track: {
        select: {
            id: true,
            name: true,
            duration_in_s: true,
            album: { select: { name: true, cover_url: true } },
            artists: {
                orderBy: { position: "asc" },
                select: { artist: { select: { id: true, name: true } } },
            },
        },
    },
    _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PinSelect;

const METERS_PER_DEGREE = 110_000;

export async function createPin(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = createPinSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { deezer_track_id, lat, lon, description } = result.data;

    try {
        const trackId = await ensureTrackFromDeezer(deezer_track_id);

        const pin = await prisma.pin.create({
            data: {
                lat,
                lon,
                description,
                track: { connect: { id: trackId } },
                user: { connect: { id: userId } },
            },
            select: pinSelect,
        });

        return res.status(201).json({ success: true, pin });
    } catch (err) {
        if (err instanceof DeezerError) {
            if (err.code === 800) {
                return res.status(404).json({ success: false, error: "Track not found" });
            }
            console.error("Deezer error while creating pin:", err);
            return res.status(502).json({ success: false, error: "Music provider unavailable" });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return res.status(404).json({ success: false, error: "Profile not found" });
        }
        console.error("Create pin error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred" });
    }
}

export async function getNearbyPins(req: Request, res: Response) {
    const result = nearbyPinSchema.safeParse(req.query);
    if(!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    }

    const { lat, lon, radius, limit } = result.data;

    const dLat = radius / METERS_PER_DEGREE;
    const dLon = radius / (METERS_PER_DEGREE * Math.max(Math.cos(lat * Math.PI / 180), 0.01));

    try {
        const rows = await prisma.$queryRaw<{ id: string; distance: number }[]>`
            WITH center AS (
                SELECT ST_SetSRID(ST_MakePoint(${lon}::float8, ${lat}::float8), 4326) AS geom
            )
            SELECT p.id,
                   ST_Distance(
                       ST_SetSRID(ST_MakePoint(p.lon, p.lat), 4326)::geography,
                       center.geom::geography
                   ) AS distance
            FROM "Pin" p, center
            WHERE ST_SetSRID(ST_MakePoint(p.lon, p.lat), 4326)
                      && ST_Expand(center.geom, ${dLon}::float8, ${dLat}::float8)
              AND ST_DWithin(
                      ST_SetSRID(ST_MakePoint(p.lon, p.lat), 4326)::geography,
                      center.geom::geography,
                      ${radius}::float8
                  )
            ORDER BY distance
            LIMIT ${limit}::int
        `;

        if (rows.length === 0) {
            return res.status(200).json({ success: true, pins: [] });
        }

        const pins = await prisma.pin.findMany({
            where: { id: { in: rows.map((r) => r.id ) } },
            select: pinSelect,
        });

        const distanceById = new Map(rows.map((r) => [r.id, r.distance]));
        const sorted = pins
            .map((p) => ({ ...p, distance_m: Math.round(distanceById.get(p.id)!) }))
            .sort((a, b) => a.distance_m - b.distance_m );
        
        return res.status(200).json({ success: true, pins: sorted });
    } catch (err) {
        console.error("Get nearby pins error:", err);
        return res.status(500).json({ success: false, error: "Database error occured" });
    }
}
