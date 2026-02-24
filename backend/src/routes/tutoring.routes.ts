import { Router } from 'express';
import { getAllTutors, getAllTutorApplications, getAllTutoringSessions, approveTutorApplication, bookTutoringSession } from '../controllers/tutoring.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/tutors', getAllTutors);
router.get('/applications', requireRole([UserRole.HOD, UserRole.ADMIN, UserRole.STAFF]), getAllTutorApplications);
router.get('/sessions', getAllTutoringSessions);

router.post('/applications/:id/approve', requireRole([UserRole.HOD, UserRole.ADMIN]), approveTutorApplication);
router.post('/sessions', bookTutoringSession);

export default router;
