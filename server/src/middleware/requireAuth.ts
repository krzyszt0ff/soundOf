import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
        req.user = { id: payload.id, role: payload.role };
        next();
    } catch {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
}