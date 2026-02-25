import { Router } from 'express';
import { getAllAssignments, createAssignment, getAllSubmissions, submitAssignment, gradeSubmission, bulkAssignTopics } from '../controllers/assignment.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/', getAllAssignments);
router.post('/', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), createAssignment);

router.get('/submissions', getAllSubmissions);
router.post('/:assignmentId/submit', requireRole([UserRole.STUDENT]), submitAssignment);
router.post('/grade', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), gradeSubmission);
router.post('/bulk-assign-topics', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), bulkAssignTopics);

export default router;
