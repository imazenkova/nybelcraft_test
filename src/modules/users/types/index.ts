import { User } from "@prisma/client"

export interface CreateUserDto extends Pick<User,"email"|"firstName"|"lastName"|"password">{}
export interface DeleteUserDto extends Pick<User,"email">{}