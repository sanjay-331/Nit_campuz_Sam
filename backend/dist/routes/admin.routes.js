"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// ON DUTY ROUTES
router.get('/on-duty', admin_controller_1.getAllOnDutyApplications);
router.post('/on-duty/apply', admin_controller_1.applyForOD);
router.put('/on-duty/:id/process', (0, auth_middleware_1.requireRole)([client_1.UserRole.STAFF, client_1.UserRole.HOD, client_1.UserRole.PRINCIPAL, client_1.UserRole.ADMIN]), admin_controller_1.processODApplication);
router.put('/on-duty/:id', admin_controller_1.updateODApplication);
// NO DUES ROUTES
router.get('/no-dues', admin_controller_1.getDuesAndCertificates);
router.post('/no-dues/update-dues', (0, auth_middleware_1.requireRole)([client_1.UserRole.STAFF, client_1.UserRole.HOD, client_1.UserRole.ADMIN]), admin_controller_1.updateDuesStatus);
router.post('/no-dues/issue', (0, auth_middleware_1.requireRole)([client_1.UserRole.HOD, client_1.UserRole.ADMIN]), admin_controller_1.issueNoDuesCertificate);
// ANALYTICS ROUTES
router.get('/analytics', (0, auth_middleware_1.requireRole)([client_1.UserRole.HOD, client_1.UserRole.PRINCIPAL, client_1.UserRole.ADMIN]), analytics_controller_1.getDashboardAnalytics);
exports.default = router;
