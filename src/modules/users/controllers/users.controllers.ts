import { User } from '@prisma/client';
import { config } from "dotenv";
import * as express from "express";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { v4 } from "uuid";
import { createUserSchema, uniqUserSchema, updUserSchema } from "../../../schemas/validation.schemas";
import { checkAuthMiddleware } from '../../auth/utils/auth.middleware';
import { USER_AVATAR_PREFIX, presignUrl, uploadImage } from '../../file/services/minio.services';
import { createUser, deleteUserByEmail, findUserByEmail, generatePdf, updUser } from '../services/users.service';

config();

const upload = multer();

export const userRouter = express.Router();

userRouter.get('/user', checkAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.user as User

    try {
        const user = await findUserByEmail(email);
        console.log(user.image)
        console.log(await presignUrl(user.image, USER_AVATAR_PREFIX))
        const transformedUser = {
            ...user,
            imageUrl: user.image && await presignUrl(user.image, USER_AVATAR_PREFIX)
        }
        res.json(transformedUser);
    } catch (error) {
        return next(error)
    }
});

userRouter.post('/user', upload.single('avatar'), async (req: Request, res: Response, next: NextFunction) => {
    const createUserDto = req.body;
    const file = req.file;

    try {
        if (!file) throw new Error('File is required')
        const uniqueFileName = v4()
        await uploadImage(file.buffer, uniqueFileName, USER_AVATAR_PREFIX, file.mimetype)

        await createUserSchema.validateAsync({ ...createUserDto });
        const newUser = await createUser(createUserDto, uniqueFileName)
        res.json(newUser);
    } catch (error) {
        return next(error)
    }
});

userRouter.delete('/user', checkAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.user as User;

    try {
        await uniqUserSchema.validateAsync({ email });
        const deletedUser = await deleteUserByEmail(email)
        res.json(deletedUser);
    } catch (error) {
        return next(error)
    }
});

userRouter.put('/user', checkAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName } = req.body;
    const { email } = req.user as User

    try {
        await updUserSchema.validateAsync({ firstName, lastName });
        const updatedUser = await updUser({ lastName, firstName, email })
        res.json(updatedUser);
    } catch (error) {
        return next(error)
    }
});

userRouter.post('/generate-pdf', async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    try {
        await uniqUserSchema.validateAsync({ email });
        const user = await findUserByEmail(email);
        const result = await generatePdf(email)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${user.firstName}_${user.lastName}.pdf"`);

        res.json({ result })
    } catch (error: any) {
        return next(error)
    }
});
