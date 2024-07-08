"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Organisation_1 = require("../entities/Organisation");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_1 = require("../utils/helper");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, phone } = req.body;
    const errors = [];
    if (!firstName) {
        errors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (!lastName) {
        errors.push({ field: 'lastName', message: 'Last name is required' });
    }
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            status: 'Bad request',
            message: 'Registration unsuccessful',
            statusCode: 400,
            errors: errors,
        });
    }
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const organisationRepository = (0, typeorm_1.getRepository)(Organisation_1.Organisation);
        const existingUser = yield userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'User already exists',
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const userId = (0, helper_1.generateUniqueUserId)();
        const orgId = (0, helper_1.generateUniqueUserId)();
        const user = userRepository.create({
            userId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
        });
        yield userRepository.save(user);
        const organisation = organisationRepository.create({
            orgId,
            name: `${firstName}'s Organisation`,
            description: `${firstName}'s Organisation created during registration`,
        });
        yield organisationRepository.save(organisation);
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.userId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        return res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                accessToken,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    organisation
                }
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: 'Server error',
                error: error.message,
            });
        }
        return res.status(500).json({
            message: 'Unknown server error',
        });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const user = yield userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication failed',
                statusCode: 401,
            });
        }
        const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication failed',
                statusCode: 401,
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.userId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                accessToken,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                }
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: 'Server error',
                error: error.message,
            });
        }
        return res.status(500).json({
            message: 'Unknown server error',
        });
    }
}));
exports.default = router;
