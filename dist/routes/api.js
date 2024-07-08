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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Organisation_1 = require("../entities/Organisation");
const User_1 = require("../entities/User");
const auth_1 = require("../utils/auth");
const class_validator_1 = require("class-validator");
const helper_1 = require("../utils/helper");
const router = (0, express_1.Router)();
router.get('/users/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const authenticatedUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const organisationRepository = (0, typeorm_1.getRepository)(Organisation_1.Organisation);
        const user = yield userRepository.findOne({ where: { userId: id }, relations: ["organisations"] });
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
router.get('/organisations', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    console.log(userId);
    try {
        const organisationRepository = (0, typeorm_1.getRepository)(Organisation_1.Organisation);
        const organisations = yield organisationRepository.createQueryBuilder("organisation")
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
router.get('/organisations/:orgId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { orgId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const organisationRepository = (0, typeorm_1.getRepository)(Organisation_1.Organisation);
        const organisation = yield organisationRepository.createQueryBuilder("organisation")
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
router.post('/organisations', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const newOrganisation = new Organisation_1.Organisation();
    newOrganisation.name = name;
    newOrganisation.description = description;
    try {
        const validationErrors = yield (0, class_validator_1.validate)(newOrganisation, { skipMissingProperties: true });
        if (validationErrors.length > 0) {
            const errors = validationErrors.map(error => {
                var _a;
                return ({
                    field: error.property,
                    message: Object.values((_a = error.constraints) !== null && _a !== void 0 ? _a : {}).join(', ')
                });
            });
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Client error',
                statusCode: 400,
                errors
            });
        }
        const organisationRepository = (0, typeorm_1.getRepository)(Organisation_1.Organisation);
        const orgId = (0, helper_1.generateUniqueOrgId)();
        const organisation = organisationRepository.create({
            orgId,
            name,
            description
        });
        yield organisationRepository.save(organisation);
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
router.get('/organisations/:orgId/users', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orgId } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({
            status: 'Bad Request',
            message: 'User ID is required',
        });
    }
    try {
        const organisationRepository = (0, typeorm_1.getRepository)(Organisation_1.Organisation);
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const organisation = yield organisationRepository.findOne({
            where: { orgId }
        });
        if (!organisation) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Organisation not found',
            });
        }
        const user = yield userRepository.findOne(userId);
        if (!user) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'User not found',
            });
        }
        if (organisation.users.some(u => u.userId === userId)) {
            return res.status(409).json({
                status: 'error',
                message: 'User already belongs to this organisation',
            });
        }
        organisation.users.push(user);
        yield organisationRepository.save(organisation);
        return res.status(200).json({
            status: 'success',
            message: 'User added to organisation successfully',
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
