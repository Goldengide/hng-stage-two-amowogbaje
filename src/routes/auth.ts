import { Router } from "express";
import { getRepository } from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { Organisation } from "../entities/Organisation";

const router = Router();

// Registration endpoint
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;
    
    try {
        const userRepository = getRepository(User);
        const organisationRepository = getRepository(Organisation);

        // Check if user already exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
        });

        // Save user to the database
        await userRepository.save(newUser);

        // Create new organisation
        const newOrganisation = organisationRepository.create({
            name: `${firstName}'s Organisation`,
            users: [newUser],
        });

        // Save organisation to the database
        await organisationRepository.save(newOrganisation);

        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: "Unknown error occurred" });
    }
});

// Login endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRepository = getRepository(User);
        
        // Find user by email
        const user = await userRepository.findOne({ where: { email }, relations: ["organisations"] });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });

        return res.status(200).json({ token, user });
    } catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: "Unknown error occurred" });
    }
});

export default router;
