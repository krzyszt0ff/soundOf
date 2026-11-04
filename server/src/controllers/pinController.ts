import { Request, Response } from "express";
import * as z from 'zod';
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { createPinSchema } from "../schemas/createPinSchema.js";
import { ensureTrackFromDeezer } from "../services/trackService.js";
import { DeezerError } from "../services/deezerService.js";

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
            select: {
                id: true,
                lat: true,
                lon: true,
                description: true,
                publish_date: true,
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
            },
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
