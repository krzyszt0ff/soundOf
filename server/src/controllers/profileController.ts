import { Request, Response } from "express";
import { followParamsSchema, profileIdSchema, updateProfileSchema } from "../schemas/profileSchemas.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import * as z from 'zod';

const profileSelect = {
    avatar_url: true,
    display_name: true,
    user: { select: { username: true } },
    bio: true,
    _count: { select: { followers: true, following: true } }
} satisfies Prisma.UserProfileSelect;

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

export async function viewProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = profileIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { profile_id } = result.data;
    const targetId = profile_id === "me" ? userId : profile_id;

    try {
        const profile = await prisma.userProfile.findUnique({
            where: { id: targetId },
            select: profileSelect,
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

export async function followProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = followParamsSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { profile_id } = result.data;

    if ( profile_id === userId ){
        return res.status(400).json({ success: false, error: "You can't follow yourself" });
    }

    try{
        const follow = await prisma.userFollowing.upsert({
            where: { follower_id_followee_id: { follower_id: userId, followee_id: profile_id } },
            create: { follower_id: userId, followee_id: profile_id },
            update: {},
        });

        return res.status(200).json({ success: true, follow })
    } catch (err) {
        console.error("Follow profile error:", err);
        return res.status(500).json({ 
            success: false, 
            error: 'Error following profile'
        });
    }
}

export async function unfollowProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
    }

    const result = followParamsSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { profile_id } = result.data;

    try{
        const follow = await prisma.userFollowing.deleteMany({
            where: { follower_id: userId, followee_id: profile_id }
        });

        return res.status(204).send();
    } catch (err) {
        console.error("Unfollow profile error:", err);
        return res.status(500).json({ 
            success: false, 
            error: 'Error unfollowing profile'
        });
    }
}