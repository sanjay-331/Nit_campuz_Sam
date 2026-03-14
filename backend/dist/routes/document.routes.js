"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// Student routes
router.post('/upload', (0, auth_middleware_1.requireRole)([client_1.UserRole.STUDENT]), document_controller_1.uploadDocument);
router.get('/my-documents', (0, auth_middleware_1.requireRole)([client_1.UserRole.STUDENT]), document_controller_1.getStudentDocuments);
// Admin / HOD routes
router.get('/pending', (0, auth_middleware_1.requireRole)([client_1.UserRole.HOD, client_1.UserRole.ADMIN, client_1.UserRole.PRINCIPAL]), document_controller_1.getAllPendingDocuments);
router.put('/:id/verify', (0, auth_middleware_1.requireRole)([client_1.UserRole.HOD, client_1.UserRole.ADMIN, client_1.UserRole.PRINCIPAL]), document_controller_1.verifyDocument);
exports.default = router;
