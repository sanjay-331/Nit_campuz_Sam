import { Router } from 'express';
import { getAllOnDutyApplications, applyForOD, processODApplication, updateODApplication, getDuesAndCertificates, updateDuesStatus, issueNoDuesCertificate } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

// ON DUTY ROUTES
router.get('/on-duty', getAllOnDutyApplications);
router.post('/on-duty/apply', applyForOD);
router.put('/on-duty/:id/process', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.PRINCIPAL, UserRole.ADMIN]), processODApplication);
router.put('/on-duty/:id', updateODApplication);

// NO DUES ROUTES
router.get('/no-dues', getDuesAndCertificates);
router.post('/no-dues/update-dues', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), updateDuesStatus);
router.post('/no-dues/issue', requireRole([UserRole.HOD, UserRole.ADMIN]), issueNoDuesCertificate);

export default router;
