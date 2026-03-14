import { Router } from 'express';
import { saveMarks, verifyMarks, publishMarks, submitAttendance, getAllCourses, getAllDepartments, getAllMarks, getAllAttendance, getAllMaterials, createMaterial, getAllExamSchedules, createExamSchedule, createDepartment, createCourse, assignHOD, assignAdvisor, getClasses } from '../controllers/academic.controller';

import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middleware/validate';
import { saveMarksSchema, submitAttendanceSchema, createMaterialSchema, createExamScheduleSchema, createDepartmentSchema, createCourseSchema, assignHODSchema, assignAdvisorSchema } from '../validators/academic.validator';
import { UserRole } from '@prisma/client';
import { generateNoDuesPdf } from '../controllers/report.controller';

const router = Router();

router.use(requireAuth);

router.get('/courses', getAllCourses);
router.get('/departments', getAllDepartments);
router.get('/marks', getAllMarks);
router.get('/attendance', getAllAttendance);
router.get('/materials', getAllMaterials);
router.get('/exam-schedules', getAllExamSchedules);
router.get('/report/no-dues/:studentId', generateNoDuesPdf);

router.get('/classes', getClasses);

// Only Staff, HOD, and Admins can submit marks or attendance or upload materials
router.post('/marks', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), validate(saveMarksSchema), saveMarks);
router.post('/marks/verify', requireRole([UserRole.EXAM_CELL, UserRole.HOD, UserRole.PRINCIPAL, UserRole.ADMIN]), verifyMarks);
router.post('/marks/publish', requireRole([UserRole.EXAM_CELL, UserRole.ADMIN]), publishMarks);
router.post('/attendance', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), validate(submitAttendanceSchema), submitAttendance);

router.post('/materials', requireRole([UserRole.STAFF, UserRole.HOD, UserRole.ADMIN]), validate(createMaterialSchema), createMaterial);
router.post('/exam-schedules', requireRole([UserRole.EXAM_CELL, UserRole.ADMIN]), validate(createExamScheduleSchema), createExamSchedule);

// Management Routes
router.post('/departments', requireRole([UserRole.ADMIN]), validate(createDepartmentSchema), createDepartment);
router.post('/courses/create', requireRole([UserRole.ADMIN, UserRole.HOD]), validate(createCourseSchema), createCourse);
router.post('/assign-hod', requireRole([UserRole.ADMIN]), validate(assignHODSchema), assignHOD);
router.post('/assign-advisor', requireRole([UserRole.ADMIN, UserRole.HOD]), validate(assignAdvisorSchema), assignAdvisor);

export default router;
