import { Request, Response } from "express";

export function hello(req : Request, res: Response) {
    return res.json({message: "Hejka patrzcie na mn umiem backend!!!"});
}