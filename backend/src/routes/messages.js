import { Router } from 'express';
import { createMessage, listMessages } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listMessages);
router.post('/', requireAuth, createMessage);

export default router;
