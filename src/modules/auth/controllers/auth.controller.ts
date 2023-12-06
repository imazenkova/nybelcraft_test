import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { signInSchema } from '../../../schemas/validation.schemas';
import { signInUser } from '../services/auth.service';
config();

export const authRouter = express.Router();

authRouter.post('/sign-in', async (req: Request, res: Response, next: NextFunction) => {
    const userCredentials = req.body;
    
    try {
        await signInSchema.validateAsync({ ...userCredentials });
        const token = await signInUser(userCredentials)
        return res.json({ token });
    } catch (error) {
        return next(error)
    }
});