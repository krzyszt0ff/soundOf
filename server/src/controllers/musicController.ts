import { Request, Response } from "express";
import * as deezer from "../services/deezerService.js";
import * as z from 'zod';
import { trackSearchSchema, deezerTrackIdSchema } from "../schemas/trackSchemas.js"

export async function searchTracks(req: Request, res: Response) {
    const result = trackSearchSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    }

    try {
        const { q, limit, index } = result.data;
        const data = await deezer.searchTracks(q, limit, index);
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Deezer search error:", err);
        return res.status(502).json({ succes: false, error: "Music provider unavailable" });
    }
}

export async function getTrackPreview(req: Request, res: Response) {
    const result = deezerTrackIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    }

    const { deezerId } = result.data;

    try {
        const track = await deezer.getTrack(deezerId);

        if (!track.preview) {
            return res.status(404).json({ success: false, error: "No preview available for this track" });
        }

                return res.status(200).json({ success: true, preview: track.preview });
    } catch (err) {
         if (err instanceof deezer.DeezerError && err.code === 800) {
            return res.status(404).json({ success: false, error: "Track not found" });
        }
        console.error("Deezer preview error:", err);
        return res.status(502).json({ success: false, error: "Music provider unavailable" });
    }
}