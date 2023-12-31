import { User } from "@prisma/client"
import { Request } from "express"

export interface CreateUserDto extends Pick<User, "email" | "firstName" | "lastName" | "password"> {
    img?: User["image"]
}
export interface DeleteUserDto extends Pick<User, "email"> { }
export interface GeneratePDFDto extends DeleteUserDto { }
export interface UpdUserDto extends Partial<Pick<User, "firstName" | "lastName">> { email: User["email"] }
export interface SignInUserDto extends Pick<User, "email" | "password"> { }
export interface AuthRequest extends Request {
    user: User
}