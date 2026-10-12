import { Router } from 'express';
import { getDoctorAvailability, listDoctors } from '../controllers/doctorController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Active doctor directory for authenticated patients booking appointments.
router.get('/', requireAuth, listDoctors);
router.get('/:doctorId/availability', requireAuth, getDoctorAvailability);

export default router;
