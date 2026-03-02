import { Router } from 'express';
import { uploadDocument, getStudentDocuments, getAllPendingDocuments, verifyDocument } from '../controllers/document.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

// Student routes
router.post('/upload', requireRole([UserRole.STUDENT]), uploadDocument);
router.get('/my-documents', requireRole([UserRole.STUDENT]), getStudentDocuments);

// Admin / HOD routes
router.get('/pending', requireRole([UserRole.HOD, UserRole.ADMIN, UserRole.PRINCIPAL]), getAllPendingDocuments);
router.put('/:id/verify', requireRole([UserRole.HOD, UserRole.ADMIN, UserRole.PRINCIPAL]), verifyDocument);

export default router;
