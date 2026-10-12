import { Router } from 'express';
import {
  listDoctorAppointments,
  transitionDoctorAppointment,
} from '../controllers/doctorController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Every route here is doctor-only: 401 without a session, 403 for patients.
router.use(requireAuth, requireRole('doctor'));

router.get('/appointments', listDoctorAppointments);
router.patch('/appointments/:id', transitionDoctorAppointment);

export default router;
