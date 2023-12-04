import express, { Request, Response } from "express"
import { PrismaClient, User } from '@prisma/client';
import { config } from "dotenv"
import { CreateUserDto, DeleteUserDto, GeneratePDFDto, UpdUserDto } from "./modules/users/types";
import { createUserSchema, uniqUserSchema, updUserSchema } from "./modules/users/schemas/create-user.schema";
import bodyParser from "body-parser";
import PDFDocument from "pdfkit";
import * as bcrypt from "bcrypt"
config();

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

export async function findUser(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    return user
}

app.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/users', async (req: Request, res: Response) => {
    const { email, firstName, lastName, password }: CreateUserDto = req.body;

    try {
        await createUserSchema.validateAsync({ firstName, lastName, password, email });

        const user = await findUser(email)
        if (user) {
            throw new Error('Such user has already exists')
        }

        const passwordHash = await bcrypt.hash(password, 5);
        const newUser = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                password: passwordHash
            }
        })
        res.json(newUser);
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
});

app.delete('/users', async (req: Request, res: Response) => {
    const { email }: DeleteUserDto = req.body;

    try {
        await uniqUserSchema.validateAsync({ email });

        const user = await findUser(email)
        if (!user) {
            throw new Error('Such user has not  exists')
        }

        const deletedUser = await prisma.user.delete({
            where: {
                email
            }
        })

        res.json(deletedUser);
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
});

app.put('/users', async (req: Request, res: Response) => {
    const { firstName, lastName, email }: UpdUserDto = req.body;

    try {
        await updUserSchema.validateAsync({ email });

        const user = await findUser(email)
        if (!user) {
            throw new Error('Such user has not  exists')
        }

        const updatedUser = await prisma.user.update({
            data: {
                firstName,
                lastName
            },
            where: {
                email
            }
        })

        res.json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
});

app.get('/generate-pdf', async (req: Request, res: Response) => {
    const { email } = req.query as GeneratePDFDto;

    try {
        await uniqUserSchema.validateAsync({ email });
        const user = await findUser(email);
        if (!user) {
            throw new Error('User not found');
        }

        const doc = new PDFDocument();

        doc.text(`Name: ${user.firstName} ${user.lastName}`);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${user.firstName}_${user.lastName}.pdf"`);

        const buffers: any[] = [];
        doc.on('data', (buffer: any) => buffers.push(buffer));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);
            await prisma.user.update({
                where: { email },
                data: {
                    pdf: pdfBuffer,
                },
            });
            console.log(pdfBuffer.toString())
            res.send(pdfBuffer);
        });
        doc.end();

    } catch (error: any) {
        res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server start on http://localhost:${process.env.PORT}`);
});