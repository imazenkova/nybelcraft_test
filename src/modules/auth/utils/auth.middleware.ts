import { PrismaClient, User } from ".prisma/client";
import { config } from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {prisma} from "../../prisma/prismaClient"
config();

const secretKey = process.env.SECRET_KEY

export const checkAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1]
        if (!token) {
            throw new Error("Token not found")
        }

        const decodedToken = jwt.verify(token, secretKey!) as { email: User["email"] }
        const user = await prisma.user.findUnique({
            where: {
                email: decodedToken.email
            }
        })

        if (!user) {
            throw new Error("User not found")
        }

        req.user = user
        next()
    } catch (error) {
        return next(error)

    }
}