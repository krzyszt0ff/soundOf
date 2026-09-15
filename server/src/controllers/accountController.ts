import { Request, Response } from "express";
import * as z from 'zod';
import bcrypt from "bcrypt";
import { credentialsSchema } from "../schemas/credentialsSchema.js";
import { prisma } from "../lib/prisma.js";
import { userRoleOptions } from "../enums.js"
import jwt from "jsonwebtoken";
import { env } from '../config/env.js';

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
        const existingUser = await prisma.userCredentials.findFirst({
            where: { 
                OR: [{ email }, { username }],
             },
            select: { userId: true, email: true, username: true },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({error: 'Email is already taken'});
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username is already taken'});
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.userCredentials.create({
            data: {
                email: email,
                username: username,
                passwordHash: passwordHash,
                userRole: userRoleOptions.USER,
            }
        });

        return res.status(200).json({
            success: true,
            userId: newUser.userId,
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            success: false,
            error: "Database error occurred,"
        });
    }
}

export async function login(req : Request, res : Response) { 
    const { identifier, password } = req.body;

    try {
        const user = await prisma.userCredentials.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }]
            }
        }) 
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash)
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.userId, role: user.userRole }, env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: "Logged in successfully" });

        return res.status(200).json({
            success: true,
            userToken: token
        })
    } catch (err) {
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