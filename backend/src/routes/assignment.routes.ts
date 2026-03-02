import { Router } from 'express';
import { getAllAssignments, createAssignment, getAllSubmissions, submitAssignment, gradeSubmission, bulkAssignTopics } from '../controllers/assignment.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middleware/validate';
import { createAssignmentSchema, submitAssignmentSchema, gradeSubmissionSchema, bulkAssignTopicsSchema } from '../validators/assignment.validator';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/', getAllAssignments);
router.post('/', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), validate(createAssignmentSchema), createAssignment);

router.get('/submissions', getAllSubmissions);
router.post('/:assignmentId/submit', requireRole([UserRole.STUDENT]), validate(submitAssignmentSchema), submitAssignment);
router.post('/grade', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), validate(gradeSubmissionSchema), gradeSubmission);
router.post('/bulk-assign-topics', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), validate(bulkAssignTopicsSchema), bulkAssignTopics);

export default router;
