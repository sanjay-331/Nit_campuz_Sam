import { z } from 'zod';

export const saveMarksSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    marks: z.record(z.string(), z.object({
      internal: z.number().optional(),
      exam: z.number().optional()
    }))
  })
});

export const submitAttendanceSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    records: z.record(z.string(), z.boolean())
  })
});

export const createMaterialSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    title: z.string().min(1, 'Title is required'),
    type: z.string().min(1, 'Type is required'),
    url: z.string().url('Must be a valid URL')
  })
});

export const createExamScheduleSchema = z.object({
  body: z.object({
    courseCode: z.string().min(1, 'Course Code is required'),
    courseName: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    duration: z.string().optional(),
    hall: z.string().min(1, 'Hall is required')
  })
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Department name is required')
  })
});

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Course name is required'),
    code: z.string().min(1, 'Course code is required'),
    staffId: z.string().optional(),
    departmentId: z.string().min(1, 'Department ID is required'),
    credits: z.union([z.number(), z.string()]),
    semester: z.union([z.number(), z.string()])
  })
});

export const assignHODSchema = z.object({
  body: z.object({
    deptId: z.string().min(1, 'Department ID is required'),
    staffId: z.string().min(1, 'Staff ID is required')
  })
});

export const assignAdvisorSchema = z.object({
  body: z.object({
    departmentId: z.string().min(1, 'Department ID is required'),
    year: z.union([z.number(), z.string()]),
    advisorId: z.string().min(1, 'Advisor ID is required')
  })
});
