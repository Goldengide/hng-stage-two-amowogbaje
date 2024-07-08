import { Router, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Organisation } from "../entities/Organisation";
import { User } from "../entities/User";
import { authenticateToken } from "../utils/auth";
import { validate, ValidationError } from "class-validator";

const router = Router();
router.get('/users/:id', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const authenticatedUserId = req.user?.userId;

    try {
        const userRepository = getRepository(User);
        const organisationRepository = getRepository(Organisation);

        const user = await userRepository.findOne({ where: { userId: id }, relations: ["organisations"] });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }

        if (user.userId !== authenticatedUserId && !user.organisations.some(org => org.users.some(u => u.userId === authenticatedUserId))) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized access',
            });
        }

        const userData = {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
        };

        return res.status(200).json({
            status: 'success',
            message: 'User data retrieved successfully',
            data: userData,
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

router.get('/organisations', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    console.log(userId)

    try {
        const organisationRepository = getRepository(Organisation);

        const organisations = await organisationRepository.createQueryBuilder("organisation")
            .leftJoin('organisation.users', 'user')
            .where('user.userId = :userId', { userId })
            .select(['organisation.orgId', 'organisation.name', 'organisation.description'])
            .getMany();

        const responseData = {
            status: 'success',
            message: 'Organisations retrieved successfully',
            data: {
                organisations: organisations,
            },
        };

        return res.status(200).json(responseData);

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

router.get('/organisations/:orgId', authenticateToken, async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const userId = req.user?.userId;

    try {
        const organisationRepository = getRepository(Organisation);

        const organisation = await organisationRepository.createQueryBuilder("organisation")
            .leftJoinAndSelect("organisation.users", "user")
            .where("organisation.orgId = :orgId", { orgId })
            .andWhere("user.userId = :userId", { userId })
            .getOne();

        if (!organisation) {
            return res.status(404).json({
                status: 'error',
                message: 'Organisation not found or unauthorized access',
            });
        }

        const responseData = {
            status: 'success',
            message: 'Organisation retrieved successfully',
            data: {
                orgId: organisation.orgId,
                name: organisation.name,
                description: organisation.description,
            },
        };

        return res.status(200).json(responseData);
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

router.post('/organisations', authenticateToken, async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const userId = req.user?.userId;


    const newOrganisation = new Organisation();
    newOrganisation.name = name;
    newOrganisation.description = description;




    try {
        const validationErrors: ValidationError[] = await validate(newOrganisation, { skipMissingProperties: true });


        if (validationErrors.length > 0) {
            const errors = validationErrors.map(error => ({
                field: error.property,
                message: Object.values(error.constraints ?? {}).join(', ')
            }));

            return res.status(400).json({
                status: 'Bad Request',
                message: 'Client error',
                statusCode: 400,
                errors
            });
        }

        const organisationRepository = getRepository(Organisation);

        const organisation = organisationRepository.create({
            name,
            description,
            users: [{ userId }]
        });

        await organisationRepository.save(organisation);

        const responseData = {
            status: 'success',
            message: 'Organisation created successfully',
            data: {
                orgId: organisation.orgId,
                name: organisation.name,
                description: organisation.description,
            },
        };

        return res.status(201).json(responseData);
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
router.get('/organisations/:orgId/users', authenticateToken, async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            status: 'Bad Request',
            message: 'User ID is required',
        });
    }

    try {
        const organisationRepository = getRepository(Organisation);
        const userRepository = getRepository(User);

        const organisation = await organisationRepository.findOne({
            where: { orgId },
            relations: ["users"]
        });
        if (!organisation) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Organisation not found',
            });
        }

        const user = await userRepository.findOne(userId);
        if (!user) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'User not found',
            });
        }

        organisation.users = [...organisation.users, user];
        await organisationRepository.save(organisation);

        return res.status(200).json({
            status: 'success',
            message: 'User added to organisation successfully',
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