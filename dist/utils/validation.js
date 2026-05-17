"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserSchema = exports.addStaffSchema = exports.loginSchema = exports.adminRegisterSchema = exports.validateIndiaMobile = void 0;
const joi_1 = __importDefault(require("joi"));
const validateIndiaMobile = (value) => {
    const indiaMobileRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return indiaMobileRegex.test(value);
};
exports.validateIndiaMobile = validateIndiaMobile;
exports.adminRegisterSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    mobile: joi_1.default.string().custom((value, helpers) => {
        if (!(0, exports.validateIndiaMobile)(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    email: joi_1.default.string().email().required(),
    username: joi_1.default.string().min(3).max(30).required(),
    password: joi_1.default.string().min(8).required(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.addStaffSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(30).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    name: joi_1.default.string().min(2).max(50).required(),
    phone: joi_1.default.string().custom((value, helpers) => {
        if (!(0, exports.validateIndiaMobile)(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
});
exports.addUserSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    mobile: joi_1.default.string().custom((value, helpers) => {
        if (!(0, exports.validateIndiaMobile)(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    city: joi_1.default.string().min(2).max(50).required(),
    state: joi_1.default.string().min(2).max(50).required(),
    country: joi_1.default.string().min(2).max(50).required(),
    assignedStaff: joi_1.default.string().required(),
});
//# sourceMappingURL=validation.js.map