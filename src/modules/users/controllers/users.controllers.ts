import { PrismaClient } from '@prisma/client';
import { config } from "dotenv";
import express, { Request, Response } from "express";
import { ValidationError } from 'joi';
import { createUserSchema, uniqUserSchema, updUserSchema } from "../schemas/validation.schemas";
import { createUser, deleteUser, findUser, updUser } from '../services/users.service';
config();

const prisma = new PrismaClient();
export const userRouter = express.Router();

export function handleErrors(error: any, res: Response): void {
    if (error instanceof ValidationError) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        res.status(400).json({ error: errorMessage });
    } else {
        res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
}

userRouter.get('/user/:email', async (req: Request, res: Response) => {
    const { email } = req.params

    try {
        const user = await findUser(email)
        res.json(user);
    } catch (error) {
        handleErrors(error, res)
    }
});

userRouter.post('/user', async (req, res) => {
    const userCredentials = req.body;
    try {
        await createUserSchema.validateAsync({ ...userCredentials });
        const newUser = await createUser(userCredentials)
        res.json(newUser);
    } catch (error) {
        handleErrors(error, res);
    }
});

userRouter.delete('/user', async (req, res) => {
    const { email } = req.body;

    try {
        await uniqUserSchema.validateAsync({ email });
        const deletedUser = await deleteUser(email)
        res.json(deletedUser);
    } catch (error) {
        handleErrors(error, res);
    }
});

userRouter.put('/user', async (req, res) => {
    const userCredentials = req.body;

    try {
        await updUserSchema.validateAsync({ ...userCredentials });
        const updatedUser = await updUser(userCredentials)
        res.json(updatedUser);
    } catch (error) {
        handleErrors(error, res);
    }
});
