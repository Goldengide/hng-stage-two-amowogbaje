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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
const Organisation_1 = require("../entities/Organisation");
const router = (0, express_1.Router)();
// Registration endpoint
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, phone } = req.body;
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const organisationRepository = (0, typeorm_1.getRepository)(Organisation_1.Organisation);
        // Check if user already exists
        const existingUser = yield userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new user
        const newUser = userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
        });
        // Save user to the database
        yield userRepository.save(newUser);
        // Create new organisation
        const newOrganisation = organisationRepository.create({
            name: `${firstName}'s Organisation`,
            users: [newUser],
        });
        // Save organisation to the database
        yield organisationRepository.save(newOrganisation);
        return res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: "Unknown error occurred" });
    }
}));
// Login endpoint
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        // Find user by email
        const user = yield userRepository.findOne({ where: { email }, relations: ["organisations"] });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Compare password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ token, user });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: "Unknown error occurred" });
    }
}));
exports.default = router;
