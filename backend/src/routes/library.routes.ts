import { Router } from 'express';
import { getAllBooks, addBook, deleteBook } from '../controllers/library.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', requireAuth, getAllBooks);
router.post('/', requireAuth, requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), addBook);
router.delete('/:id', requireAuth, requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), deleteBook);

export default router;
