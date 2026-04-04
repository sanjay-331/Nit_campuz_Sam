import { Router } from 'express';
import { getAllDiscussions, createDiscussion, deleteDiscussion } from '../controllers/discussion.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAllDiscussions);
router.post('/', requireAuth, createDiscussion);
router.delete('/:id', requireAuth, deleteDiscussion);

export default router;
