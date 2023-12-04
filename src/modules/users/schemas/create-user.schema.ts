import Joi from "joi"

export const createUserSchema = Joi.object({
    firstName: Joi.string()
        .min(3)
        .max(30)
        .required(),
    lastName: Joi.string()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})
export const uniqUserSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})

export const updUserSchema = Joi.object({
    firstName: Joi.string()
        .min(3)
        .max(30).optional(),
    lastName: Joi.string()
        .min(3)
        .max(30).optional(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required()
})


// try {
//     const value = await schema.validateAsync({ username: 'abc', birth_year: 1994 });
// }
// catch (err) { }