import express, { Request, Response } from "express"
import { PrismaClient, User } from '@prisma/client';
import { config } from "dotenv"
import { CreateUserDto } from "./modules/users/types";
import { schema } from "./modules/users/schemas/create-user.schema";
import bodyParser from "body-parser";
import * as bcrypt from "bcrypt"
config();

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

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
        await schema.validateAsync({ firstName, lastName, password, email });

        const user = await prisma.user.findUnique({ where: { email } })
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

app.listen(process.env.PORT, () => {
    console.log('Server start');
});