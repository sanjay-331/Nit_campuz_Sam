import { Router } from 'express';
import { getAllMentorAssignments, getMyMentees, autoAssignMentees, updateMentorAssignment, bulkUpdateMentorAssignments, getAllRemarks, createRemark } from '../controllers/mentoring.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/assignments', getAllMentorAssignments);
router.get('/my-mentees', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), getMyMentees);
router.post('/assignments/auto-assign', requireRole([UserRole.HOD, UserRole.ADMIN]), autoAssignMentees);
router.put('/assignments', requireRole([UserRole.HOD, UserRole.ADMIN, UserRole.STAFF]), updateMentorAssignment);
router.post('/assignments/bulk', requireRole([UserRole.HOD, UserRole.ADMIN]), bulkUpdateMentorAssignments);

router.get('/remarks', getAllRemarks);
router.post('/remarks', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), createRemark);

export default router;
