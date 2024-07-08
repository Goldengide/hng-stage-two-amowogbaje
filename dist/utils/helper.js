"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueOrgId = exports.generateUniqueUserId = void 0;
const uuid_1 = require("uuid");
const generateUniqueUserId = () => {
    return (0, uuid_1.v4)();
};
exports.generateUniqueUserId = generateUniqueUserId;
const generateUniqueOrgId = () => {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 8);
    return `org_${timestamp}_${randomString}`;
};
exports.generateUniqueOrgId = generateUniqueOrgId;
