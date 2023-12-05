import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { CreateUserDto, DeleteUserDto, UpdUserDto } from '../../../types';

config();

const prisma = new PrismaClient();

export async function findUser(email: User["email"]) {
    const user = await prisma.user.findUnique({ where: { email } })
    return user
}

export const createUser = async (userCredentials: CreateUserDto) => {
    const { email, firstName, lastName, password } = userCredentials

    const user = await findUser(email);
    if (user) {
        throw new Error('Such user already exists');
    }

    const passwordHash = await bcrypt.hash(password, 5);
    const newUser = await prisma.user.create({
        data: {
            email,
            firstName,
            lastName,
            password: passwordHash,
        },
    });
    return newUser
}

export const deleteUser = async (userCredentials: DeleteUserDto) => {
    const { email } = userCredentials

    const user = await findUser(email);
    if (!user) {
        throw new Error('Such user does not exist');
    }

    const deletedUser = await prisma.user.delete({
        where: { email },
    });
    return deletedUser
}

export const updUser = async (userCredentials: UpdUserDto) => {
    const { lastName, firstName, email } = userCredentials

    const user = await findUser(email);
    if (!user) {
        throw new Error('Such user does not exist');
    }

    const updatedUser = await prisma.user.update({
        data: {
            firstName,
            lastName,
        },
        where: { email },
    });
    return updatedUser
}