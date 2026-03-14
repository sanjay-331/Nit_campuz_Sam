"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkAssignTopicsSchema = exports.gradeSubmissionSchema = exports.submitAssignmentSchema = exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssignmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().min(1, 'Course ID is required'),
        title: zod_1.z.string().min(1, 'Title is required'),
        dueDate: zod_1.z.string().min(1, 'Due date is required')
    })
});
exports.submitAssignmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        studentId: zod_1.z.string().min(1, 'Student ID is required'),
        fileUrl: zod_1.z.string().optional().nullable(),
        textSubmission: zod_1.z.string().optional().nullable(),
        topic: zod_1.z.string().optional().nullable(),
        remarks: zod_1.z.string().optional().nullable()
    }),
    params: zod_1.z.object({
        assignmentId: zod_1.z.string().min(1, 'Assignment ID is required')
    })
});
exports.gradeSubmissionSchema = zod_1.z.object({
    body: zod_1.z.object({
        assignmentId: zod_1.z.string().min(1, 'Assignment ID is required'),
        studentId: zod_1.z.string().min(1, 'Student ID is required'),
        grade: zod_1.z.string().min(1, 'Grade is required')
    })
});
exports.bulkAssignTopicsSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().min(1, 'Course ID is required'),
        assignments: zod_1.z.array(zod_1.z.object({
            studentId: zod_1.z.string().min(1, 'Student ID is required'),
            topic: zod_1.z.string().optional().nullable(),
            remarks: zod_1.z.string().optional().nullable()
        }))
    })
});
