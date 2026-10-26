import { Request, Response } from "express";
import { updateProfileSchema } from "../schemas/profileSchema.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import * as z from 'zod';

export async function updateProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const {display_name, avatar_url, bio} = result.data;

    // TBA: uploading avatars

    try {
        const profile = await prisma.userProfile.update({
            where: { id: userId },
            data: { display_name, avatar_url, bio },
            select: {
                display_name: true,
                avatar_url: true,
                bio: true,
            }
        });

        return res.status(200).json({ success: true, profile })
    } catch (err) {
         if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return res.status(404).json({ success: false, error: "Profile not found" });
        }
        console.error("Update profile error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred" });
    }
}