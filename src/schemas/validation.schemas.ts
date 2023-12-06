import Joi from "joi"
export const createUserSchema = Joi.object({
    firstName: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'First name must be a string',
            'string.empty': 'First name cannot be empty',
            'string.min': 'First name must be at least {#limit} characters long',
            'string.max': 'First name cannot exceed {#limit} characters',
            'any.required': 'First name is a required field'
        }),
    lastName: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'Last name must be a string',
            'string.empty': 'Last name cannot be empty',
            'string.min': 'Last name must be at least {#limit} characters long',
            'string.max': 'Last name cannot exceed {#limit} characters',
            'any.required': 'Last name is a required field'
        }),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be alphanumeric and between 3 and 30 characters long',
            'any.required': 'Password is a required field'
        }),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is a required field'
        })
});

export const uniqUserSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is a required field'
        })
});

export const updUserSchema = Joi.object({
    firstName: Joi.string()
        .min(3)
        .max(30)
        .optional()
        .messages({
            'string.base': 'First name must be a string',
            'string.empty': 'First name cannot be empty',
            'string.min': 'First name must be at least {#limit} characters long',
            'string.max': 'First name cannot exceed {#limit} characters'
        }),
    lastName: Joi.string()
        .min(3)
        .max(30)
        .optional()
        .messages({
            'string.base': 'Last name must be a string',
            'string.empty': 'Last name cannot be empty',
            'string.min': 'Last name must be at least {#limit} characters long',
            'string.max': 'Last name cannot exceed {#limit} characters'
        })
});

export const signInSchema = Joi.object({
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be alphanumeric and between 3 and 30 characters long',
            'any.required': 'Password is a required field'
        }),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is a required field'
        })
});