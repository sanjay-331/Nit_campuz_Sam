"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academic_controller_1 = require("../controllers/academic.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/courses', academic_controller_1.getAllCourses);
router.get('/departments', academic_controller_1.getAllDepartments);
// Only Staff, HOD, and Admins can submit marks or attendance
router.post('/marks', (0, auth_middleware_1.requireRole)([client_1.UserRole.STAFF, client_1.UserRole.HOD, client_1.UserRole.ADMIN]), academic_controller_1.saveMarks);
router.post('/attendance', (0, auth_middleware_1.requireRole)([client_1.UserRole.STAFF, client_1.UserRole.HOD, client_1.UserRole.ADMIN]), academic_controller_1.submitAttendance);
exports.default = router;
