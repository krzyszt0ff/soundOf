import { Request, Response } from "express";
import * as z from 'zod';
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { createPinSchema, nearbyPinSchema, pinIdSchema, pinCommentSchema, commentParamsSchema } from "../schemas/pinSchemas.js";
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

export async function likePin(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = pinIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { id: pinId } = result.data;

    try {
        const pinLike = await prisma.pinLike.upsert({
            where: { user_id_pin_id: { user_id: userId, pin_id: pinId } },
            create: { user_id: userId, pin_id: pinId },
            update: {},
        });
        return res.status(201).json({ success: true, pinLike });

    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
            return res.status(404).json({ success: false, error: "Pin not found" });
        }
        console.error("Like pin error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred" });
    }
}

export async function unlikePin(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = pinIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { id: pinId } = result.data;

    try {
        const pinLike = await prisma.pinLike.deleteMany({
            where: { user_id: userId, pin_id: pinId },
        });
        return res.status(204).send();

    } catch (err) {
        console.error("Unlike pin error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred" });
    }
}

export async function commentPin(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const params = pinIdSchema.safeParse(req.params);
    const body = pinCommentSchema.safeParse(req.body);

    if (!params.success) {
        return res.status(400).json({ success: false, error: z.flattenError(params.error) });
    }
    if (!body.success) {
        return res.status(400).json({ success: false, error: z.flattenError(body.error) });
    }

    const { id: pinId } = params.data;
    const { comment } = body.data;

    try {
        const pinComment = await prisma.pinComment.create({
            data: {
                pin_id: pinId,
                user_id: userId,
                comment: comment,
            }
        })
        return res.status(201).json({ success: true, pinComment });
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
            return res.status(404).json({ success: false, error: "Pin not found" });
        }
        console.error("Create pin comment error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred" });
    }
}

export async function deleteComment(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = commentParamsSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { id: pinId, commentId } = result.data;
    const isAdmin = req.user?.role === "admin";

    try {
        const { count } = await prisma.pinComment.deleteMany({
            where: {
                id: commentId,
                pin_id: pinId,
                // admin can delete any comment, others only their own
                ...(isAdmin ? {} : { user_id: userId }),
            },
        });

        if (count === 0) {
            return res.status(404).json({ success: false, error: "Comment not found" });
        }
        return res.status(204).send();
    } catch (err) {
        console.error("Delete comment error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred" });
    }
}

export async function deletePin(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = pinIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { id: pinId } = result.data;
    const isAdmin = req.user?.role === "admin";

    try {
        const { count } = await prisma.pin.deleteMany({
            where: {
                id: pinId,
                // admin can delete any comment, others only their own
                ...(isAdmin ? {} : { user_id: userId }),
            },
        });

        if (count === 0) {
            return res.status(404).json({ success: false, error: "Comment not found" });
        }
        return res.status(204).send();
    } catch (err) {
        console.error("Delete comment error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred" });
    }
}

export async function viewPinComments(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = pinIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { id: pin_id } = result.data;

    try {
        const profile = await prisma.pinComment.findMany({
            where: { pin_id: pin_id },
            select: { user_id: true, publish_date: true, comment: true },
        });
    
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found!'
            })
        }

        return res.status(200).json({ success: true, profile })

    } catch(err) {
        console.error("Search profile error:", err);
        return res.status(500).json({ 
            success: false, 
            error: 'Error searching profile'
        });
    }
}