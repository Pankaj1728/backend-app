import Joi from 'joi';

export const validateIndiaMobile = (value: string): boolean => {
    const indiaMobileRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return indiaMobileRegex.test(value);
};

export const adminRegisterSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    mobile: Joi.string().custom((value, helpers) => {
        if (!validateIndiaMobile(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    email: Joi.string().email().trim().lowercase().required(),
    username: Joi.string().min(3).max(30).trim().alphanum().required(),
    password: Joi.string().min(8).max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .message('Password must contain uppercase, lowercase, number and special character')
        .required(),
    dateOfBirth: Joi.date().optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const addStaffSchema = Joi.object({
    username: Joi.string().min(3).max(30).trim().alphanum().required(),
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(8).max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .message('Password must contain uppercase, lowercase, number and special character')
        .required(),
    name: Joi.string().min(2).max(50).trim().required(),
    phone: Joi.string().custom((value, helpers) => {
        if (!validateIndiaMobile(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    dateOfBirth: Joi.date().optional(),
});

export const addUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().trim().lowercase().required(),
    mobile: Joi.string().custom((value, helpers) => {
        if (!validateIndiaMobile(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    city: Joi.string().min(2).max(50).trim().required(),
    state: Joi.string().min(2).max(50).trim().required(),
    country: Joi.string().min(2).max(50).trim().required(),
    assignedStaff: Joi.string().required(),
});