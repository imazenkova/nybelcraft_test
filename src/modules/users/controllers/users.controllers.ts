import { PrismaClient, User } from '@prisma/client';
import { config } from "dotenv";
import * as express  from "express";
import { Request, Response } from "express";
import { ValidationError } from 'joi';
import { createUserSchema, uniqUserSchema, updUserSchema } from "../../../schemas/validation.schemas";
import { createUser, deleteUserByEmail, findUser, updUser } from '../services/users.service';
import { checkAuthMiddleware } from '../../auth/utils/auth.middleware';
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

userRouter.get('/user', checkAuthMiddleware, async (req: Request, res: Response) => {
    const { email } = req.user as User

    try {
        const user = await findUser(email)
        res.json(user);
    } catch (error) {
        handleErrors(error, res)
    }
});

userRouter.post('/user', async (req: Request, res: Response) => {
    const userCredentials = req.body;
    try {
        await createUserSchema.validateAsync({ ...userCredentials });
        const newUser = await createUser(userCredentials)
        res.json(newUser);
    } catch (error) {
        handleErrors(error, res);
    }
});

userRouter.delete('/user', checkAuthMiddleware, async (req: Request, res: Response) => {
    const { email } = req.user as User;

    try {
        await uniqUserSchema.validateAsync({ email });
        const deletedUser = await deleteUserByEmail(email)
        res.json(deletedUser);
    } catch (error) {
        handleErrors(error, res);
    }
});

userRouter.put('/user',checkAuthMiddleware, async (req: Request, res: Response) => {
    const { firstName, lastName } = req.body;
    const { email } = req.user as User

    try {
        await updUserSchema.validateAsync({ firstName, lastName });
        const updatedUser = await updUser({ lastName, firstName, email })
        res.json(updatedUser);
    } catch (error) {
        handleErrors(error, res);
    }
});
