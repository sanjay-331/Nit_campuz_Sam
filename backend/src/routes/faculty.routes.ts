import { Router } from 'express';
import { getFacultyPerformance, getAllFacultyPerformance } from '../controllers/faculty.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/performance/all', requireAuth, requireRole([UserRole.ADMIN, UserRole.PRINCIPAL]), getAllFacultyPerformance);
router.get('/performance/:userId', requireAuth, getFacultyPerformance);

export default router;
