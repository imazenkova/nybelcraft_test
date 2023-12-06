import { User } from '@prisma/client';
import axios from "axios";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import PDFDocument from "pdfkit";
import { CreateUserDto, UpdUserDto } from '../../../types';
import { USER_AVATAR_PREFIX, presignUrl } from '../../file/services/minio.services';
import { prisma } from "../../prisma/prismaClient";
config();

export async function findUserByEmail(email: User["email"]) {
    const user = await prisma.user.findUnique({ where: { email } })
    return user
}

export const createUser = async (userCredentials: CreateUserDto, fileName: string) => {
    const { email, firstName, lastName, password } = userCredentials

    const user = await findUserByEmail(email);
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
            image: fileName
        },
    });
    return newUser
}

export const deleteUserByEmail = async (email: User["email"]) => {
    const user = await findUserByEmail(email);

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

    const user = await findUserByEmail(email);
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

export const generatePdf = async (email: User["email"]) => {
    const x = 100;
    const y = 100;
    const width = 200;
    const height = 200;

    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    const photoPath = await presignUrl(user.image, USER_AVATAR_PREFIX);
    const photo = await axios.get(photoPath, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(photo.data, 'binary');
    const doc = new PDFDocument();

    doc.text(`Name: ${user.firstName} ${user.lastName}`);
    doc.image(buffer, x, y, { width: width, height: height });

    const buffers: any[] = [];
    doc.on('data', (buffer: any) => buffers.push(buffer));

    const asyncTask = new Promise((resolve, reject) => {
        doc.on('end', async () => {
            try {
                const pdfBuffer = Buffer.concat(buffers);
                await prisma.user.update({
                    where: { email },
                    data: {
                        pdf: pdfBuffer,
                    },
                });

                resolve(true)
            } catch (error) {
                resolve(false)
            }
        });

    });

    doc.end()
    const result = await asyncTask;
    return result
}
