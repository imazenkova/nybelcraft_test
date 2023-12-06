import { PrismaClient } from '@prisma/client';
import bodyParser from "body-parser";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { ValidationError } from 'joi';
import { authRouter } from './modules/auth/controllers/auth.controller';
import { userRouter } from "./modules/users/controllers/users.controllers";
config();

export function handleErrors(error: any, res: Response): void {
    if (error instanceof ValidationError) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        res.status(400).json({ error: errorMessage });
    } else {
        res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(userRouter)
app.use(authRouter)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    handleErrors(err, res)
})


app.listen(process.env.PORT, () => {
    console.log(`Server start on http://localhost:${process.env.PORT}`);
});