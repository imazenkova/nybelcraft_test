import { PrismaClient } from '@prisma/client';
import { config } from "dotenv";
import express, { Request, Response } from "express";
import { handleErrors } from '../../users/controllers/users.controllers';
import { signInSchema } from '../../../schemas/validation.schemas';
import { signInUser } from '../services/auth.service';
config();

const prisma = new PrismaClient();
export const authRouter = express.Router();

authRouter.post('/sign-in', async (req: Request, res: Response) => {
    const userCredentials = req.body;

    try {
        await signInSchema.validateAsync({ ...userCredentials });
        const token = await signInUser(userCredentials)
        return res.json({ token });
    } catch (error) {
        handleErrors(error, res)
    }
});