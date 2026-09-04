import { Request, Response } from "express";
import * as z from 'zod';
import bcrypt from "bcrypt";
import { credentialsSchema } from "../schemas/credentialsSchema.js";
import { prisma } from "../lib/prisma.js";
import { userRoleOptions } from "../enums.js"

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
                return res.status(500).json({error: 'Email is already taken'});
            }
            if (existingUser.username === username) {
                return res.status(500).json({ error: 'Username is already taken'});
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

// test function, to delete in the future :((
export function hello(req : Request, res: Response) {
    return res.json({message: "Hejka patrzcie na mn umiem backend!!!"});
}