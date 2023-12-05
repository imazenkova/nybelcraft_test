import { PrismaClient } from '@prisma/client';
import * as bcrypt from "bcrypt";
import bodyParser from "body-parser";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import PDFDocument from "pdfkit";
import jwt from "jsonwebtoken";
import { ValidationError } from 'joi';
import { createUserSchema, signInSchema, uniqUserSchema, updUserSchema } from "./modules/users/schemas/create-user.schema";
import { CreateUserDto, DeleteUserDto, GeneratePDFDto, UpdUserDto } from "./modules/users/types";
import {handleErrors, userRouter} from "./modules/users/controllers/users.controllers"
import { findUser } from './modules/users/users.service';
config();


const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(userRouter)

//TODO: ключ в env
// const secretKey = process.env.SECRET_KEY
const secretKey = " process.env.SECRET_KEY"

app.post('/image', async (req: Request, res: Response) => {
    try {

    }
    catch (error) { }
})
app.post('/generate-pdf', async (req: Request, res: Response) => {
    const { email }: GeneratePDFDto = req.body;

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
            const updUser = await prisma.user.update({
                where: { email },
                data: {
                    pdf: pdfBuffer,
                },
            });
            //    res.send(!!updUser);
            res.send(pdfBuffer.toJSON());

        });
        doc.end();


    } catch (error: any) {
        handleErrors(error, res)
    }
});

app.post('/sign-in', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        await signInSchema.validateAsync({ email, password });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.id }, secretKey);

        return res.json({ token });
    } catch (error) {
        handleErrors(error, res)
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server start on http://localhost:${process.env.PORT}`);
});