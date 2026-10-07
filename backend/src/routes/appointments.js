import { Router } from 'express';
import { createAppointment, listAppointments } from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listAppointments);
router.post('/', requireAuth, createAppointment);

export default router;
