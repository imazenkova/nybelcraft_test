import { User } from "@prisma/client"
import { extend } from "joi"

export interface CreateUserDto extends Pick<User, "email" | "firstName" | "lastName" | "password"> { }
export interface DeleteUserDto extends Pick<User, "email"> { }
export interface GeneratePDFDto extends DeleteUserDto{}
export interface UpdUserDto extends Partial<Pick<User, "firstName" | "lastName">> { email: string }