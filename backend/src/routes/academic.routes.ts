import { Router } from 'express';
import { saveMarks, submitAttendance, getAllCourses, getAllDepartments, getAllMarks, getAllAttendance, getAllMaterials, createMaterial, getAllExamSchedules, createExamSchedule, createDepartment, createCourse, assignHOD, assignAdvisor, getClasses } from '../controllers/academic.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/courses', getAllCourses);
router.get('/departments', getAllDepartments);
router.get('/marks', getAllMarks);
router.get('/attendance', getAllAttendance);
router.get('/materials', getAllMaterials);
router.get('/exam-schedules', getAllExamSchedules);

router.get('/classes', getClasses);

// Only Staff, HOD, and Admins can submit marks or attendance or upload materials
router.post('/marks', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), saveMarks);
router.post('/attendance', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), submitAttendance);
router.post('/materials', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), createMaterial);
router.post('/exam-schedules', requireRole([UserRole.EXAM_CELL, UserRole.ADMIN]), createExamSchedule);

// Management Routes
router.post('/departments', requireRole([UserRole.ADMIN]), createDepartment);
router.post('/courses/create', requireRole([UserRole.ADMIN, UserRole.HOD]), createCourse);
router.post('/assign-hod', requireRole([UserRole.ADMIN]), assignHOD);
router.post('/assign-advisor', requireRole([UserRole.ADMIN, UserRole.HOD]), assignAdvisor);

export default router;
