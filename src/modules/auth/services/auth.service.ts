import { PrismaClient } from '@prisma/client';
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SignInUserDto } from '../../../types';
import { config } from "dotenv";
config();

const prisma = new PrismaClient();

const secretKey = process.env.SECRET_KEY


export const signInUser = async (userCredentials: SignInUserDto) => {
    const { email, password } = userCredentials

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ email }, secretKey!);

    return token
}
