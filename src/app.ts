import { PrismaClient } from '@prisma/client';
import bodyParser from "body-parser";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { authRouter } from './modules/auth/controllers/auth.controller';
import { handleErrors, userRouter } from "./modules/users/controllers/users.controllers";
import { uniqUserSchema } from "./schemas/validation.schemas";
import { findUser } from './modules/users/services/users.service';
import { GeneratePDFDto } from "./types";
config();

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(userRouter)
app.use(authRouter)



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

app.listen(process.env.PORT, () => {
    console.log(`Server start on http://localhost:${process.env.PORT}`);
});