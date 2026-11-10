import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { authCookieOptions } from "../config/cookies.js";

const TOKEN_TTL_S = 60 * 60 * 24 * 7;
const RENEW_WHEN_LEFT_S = 60 * 60 * 24; // refreshes token when < 1 day left

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
        req.user = { id: payload.id, role: payload.role };
        const nowS = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp - nowS < RENEW_WHEN_LEFT_S) {
            const fresh = jwt.sign(
                { id: payload.id, role: payload.role },
                env.JWT_SECRET,
                { expiresIn: TOKEN_TTL_S }
            );
            res.cookie('token', fresh, { ...authCookieOptions, maxAge: TOKEN_TTL_S * 1000 });
        }
        next();
    } catch {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
}