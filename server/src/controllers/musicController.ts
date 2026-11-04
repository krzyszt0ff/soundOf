import { Request, Response } from "express";
import * as deezer from "../services/deezerService.js";
import * as z from 'zod';
import { trackSearchSchema } from "../schemas/trackSearchSchema.js"

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