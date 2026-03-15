"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignAdvisorSchema = exports.assignHODSchema = exports.createCourseSchema = exports.createDepartmentSchema = exports.createExamScheduleSchema = exports.createMaterialSchema = exports.submitAttendanceSchema = exports.saveMarksSchema = void 0;
const zod_1 = require("zod");
exports.saveMarksSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().min(1, 'Course ID is required'),
        marks: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
            internal: zod_1.z.number().optional(),
            exam: zod_1.z.number().optional()
        }))
    })
});
exports.submitAttendanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().min(1, 'Course ID is required'),
        records: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean())
    })
});
exports.createMaterialSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().min(1, 'Course ID is required'),
        title: zod_1.z.string().min(1, 'Title is required'),
        type: zod_1.z.string().min(1, 'Type is required'),
        url: zod_1.z.string().url('Must be a valid URL')
    })
});
exports.createExamScheduleSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseCode: zod_1.z.string().min(1, 'Course Code is required'),
        courseName: zod_1.z.string().optional(),
        date: zod_1.z.string().min(1, 'Date is required'),
        time: zod_1.z.string().min(1, 'Time is required'),
        duration: zod_1.z.string().optional(),
        hall: zod_1.z.string().min(1, 'Hall is required')
    })
});
exports.createDepartmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Department name is required')
    })
});
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Course name is required'),
        code: zod_1.z.string().min(1, 'Course code is required'),
        staffId: zod_1.z.string().optional(),
        departmentId: zod_1.z.string().min(1, 'Department ID is required'),
        credits: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
        semester: zod_1.z.union([zod_1.z.number(), zod_1.z.string()])
    })
});
exports.assignHODSchema = zod_1.z.object({
    body: zod_1.z.object({
        deptId: zod_1.z.string().min(1, 'Department ID is required'),
        staffId: zod_1.z.string().min(1, 'Staff ID is required')
    })
});
exports.assignAdvisorSchema = zod_1.z.object({
    body: zod_1.z.object({
        departmentId: zod_1.z.string().min(1, 'Department ID is required'),
        year: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
        advisorId: zod_1.z.string().min(1, 'Advisor ID is required')
    })
});
