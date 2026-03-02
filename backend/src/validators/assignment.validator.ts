import { z } from 'zod';

export const createAssignmentSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    title: z.string().min(1, 'Title is required'),
    dueDate: z.string().min(1, 'Due date is required')
  })
});

export const submitAssignmentSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    fileUrl: z.string().optional().nullable(),
    textSubmission: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    remarks: z.string().optional().nullable()
  }),
  params: z.object({
    assignmentId: z.string().min(1, 'Assignment ID is required')
  })
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    assignmentId: z.string().min(1, 'Assignment ID is required'),
    studentId: z.string().min(1, 'Student ID is required'),
    grade: z.string().min(1, 'Grade is required')
  })
});

export const bulkAssignTopicsSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    assignments: z.array(z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      topic: z.string().optional().nullable(),
      remarks: z.string().optional().nullable()
    }))
  })
});
