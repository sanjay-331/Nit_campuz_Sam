import { Router } from 'express';
import { getAllUsers, promoteClass, updateUserPermissions, createUser, bulkCreateUsers, updateUser, removeUser, updateUsersStatus, transferStudents, bulkPromoteStudents } from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all user routes
router.use(requireAuth);

// Get all users
router.get('/', getAllUsers);

// Create user
router.post('/', requireRole([UserRole.ADMIN]), createUser);

// Bulk create users
router.post('/bulk', requireRole([UserRole.ADMIN]), bulkCreateUsers);

// Only Admins or HODs should be able to promote classes
router.post('/promote', requireRole([UserRole.ADMIN, UserRole.HOD, UserRole.PRINCIPAL]), promoteClass);

// Update user status
router.post('/status', requireRole([UserRole.ADMIN]), updateUsersStatus);

// Admin permission update
router.put('/:userId/permissions', requireRole([UserRole.ADMIN]), updateUserPermissions);

// Update user
router.put('/:id', requireRole([UserRole.ADMIN]), updateUser);

// Remove user
router.delete('/:id', requireRole([UserRole.ADMIN]), removeUser);

// Transfer students
router.post('/transfer', requireRole([UserRole.ADMIN, UserRole.HOD]), transferStudents);

// Bulk promote students
router.post('/bulk-promote', requireRole([UserRole.ADMIN, UserRole.HOD]), bulkPromoteStudents);

export default router;
