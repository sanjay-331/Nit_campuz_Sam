"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Protect all user routes
router.use(auth_middleware_1.requireAuth);
// Get all users
router.get('/', user_controller_1.getAllUsers);
// Create user
router.post('/', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN]), user_controller_1.createUser);
// Bulk create users
router.post('/bulk', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN]), user_controller_1.bulkCreateUsers);
// Only Admins or HODs should be able to promote classes
router.post('/promote', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HOD, client_1.UserRole.PRINCIPAL]), user_controller_1.promoteClass);
// Update user status
router.post('/status', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN]), user_controller_1.updateUsersStatus);
// Admin permission update
router.put('/:userId/permissions', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN]), user_controller_1.updateUserPermissions);
// Update user
router.put('/:id', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN]), user_controller_1.updateUser);
// Remove user
router.delete('/:id', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN]), user_controller_1.removeUser);
// Transfer students
router.post('/transfer', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HOD]), user_controller_1.transferStudents);
// Bulk promote students
router.post('/bulk-promote', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HOD]), user_controller_1.bulkPromoteStudents);
exports.default = router;
