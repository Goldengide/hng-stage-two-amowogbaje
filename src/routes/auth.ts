import { Router } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Organisation } from '../entities/Organisation';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { generateUniqueUserId } from '../utils/helper';

const router = Router();

router.post('/register', async (req, res) => {
    const {firstName, lastName, email, password, phone } = req.body;

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
        const userRepository = getRepository(User);
        const organisationRepository = getRepository(Organisation);

        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'User already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = generateUniqueUserId()
        const orgId = generateUniqueUserId()

        const user = userRepository.create({
            userId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
        });
        await userRepository.save(user);

        const organisation = organisationRepository.create({
            orgId,
            name: `${firstName}'s Organisation`,
            description: `${firstName}'s Organisation created during registration`,
        });
        await organisationRepository.save(organisation);

        const accessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });

        
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
    } catch (error) {
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
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRepository = getRepository(User);

        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication failed',
                statusCode: 401,
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication failed',
                statusCode: 401,
            });
        }

        const accessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });

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
    } catch (error) {
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
});




 
export default router;
