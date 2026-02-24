import { Router } from 'express';
import { getAllUsers, promoteClass, updateUserPermissions } from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all user routes
router.use(requireAuth);

// Get all users
router.get('/', getAllUsers);

// Only Admins or HODs should be able to promote classes
router.post('/promote', requireRole([UserRole.ADMIN, UserRole.HOD, UserRole.PRINCIPAL]), promoteClass);

// Admin permission update
router.put('/:userId/permissions', requireRole([UserRole.ADMIN]), updateUserPermissions);

export default router;
