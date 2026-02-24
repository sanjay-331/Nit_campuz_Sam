"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Protect all user routes
router.use(auth_middleware_1.requireAuth);
router.get('/', user_controller_1.getAllUsers);
// Only Admins or HODs should be able to promote classes
router.post('/promote', (0, auth_middleware_1.requireRole)([client_1.UserRole.ADMIN, client_1.UserRole.HOD, client_1.UserRole.PRINCIPAL]), user_controller_1.promoteClass);
exports.default = router;
