import { Router } from 'express';
import {
  deactivateSlot,
  listDoctorAppointments,
  listMyAvailability,
  publishAvailability,
  transitionDoctorAppointment,
} from '../controllers/doctorController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Every route here is doctor-only: 401 without a session, 403 for patients.
router.use(requireAuth, requireRole('doctor'));

router.get('/appointments', listDoctorAppointments);
router.patch('/appointments/:id', transitionDoctorAppointment);
router.get('/availability', listMyAvailability);
router.post('/availability', publishAvailability);
router.patch('/availability/:id/deactivate', deactivateSlot);

export default router;
