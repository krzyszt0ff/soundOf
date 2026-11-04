import { Request, Response } from "express";
import * as z from 'zod';
import bcrypt from "bcrypt";
import { credentialsSchema } from "../schemas/credentialsSchema.js";
import { loginSchema } from "../schemas/loginSchema.js";
import { prisma } from "../lib/prisma.js";
import { userRoleOptions } from "../enums.js"
import jwt from "jsonwebtoken";
import { env } from '../config/env.js';
import { Prisma } from "../generated/prisma/client.js";

const SALT_ROUNDS = 12;
const DUMMY_HASH = bcrypt.hashSync("dummy", SALT_ROUNDS);

export async function register(req : Request, res : Response) {
    const result = credentialsSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error)
        });
    }

    const { email, username, password } = result.data;

    try {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await prisma.userCredentials.create({
            data: {
                email: email,
                username: username,
                password_hash: passwordHash,
                user_role: userRoleOptions.USER,
                profile: { create: {} }
            }
        });

        return res.status(201).json({
            success: true,
            userId: newUser.id,
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return res.status(409).json({ success: false, error: "Email or username already taken" });
        }
        console.error("Register error:", err);
        return res.status(500).json({
            success: false,
            error: "Database error occurred"
        });
    }
}

export async function login(req : Request, res : Response) { 
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: z.flattenError(result.error),
        });
    }

    const { identifier, password } = result.data;

    try {
        const user = await prisma.userCredentials.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }]
            }
        }) 

        const isMatch = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
        if (!user || !isMatch) return res.status(401).json({ success: false, error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: user.user_role }, env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true
        })
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ 
            success: false, 
            error: 'Error logging in'
        });
    }
}

// test function, to delete in the future :((
export function hello(req : Request, res: Response) {
    return res.json({message: "Hejka patrzcie na mn umiem backend!!!"});
}