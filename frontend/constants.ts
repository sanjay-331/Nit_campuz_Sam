

import { UserRole, User, Department, Course, Student, Staff, Mark, Attendance, ActivityLog, StudentStatus, Alumnus, ClassInDepartment, Reminder, TodaysClass, UpcomingEvent, Permission, Notification, Assignment, Material, Book, ExamSchedule, Grade, StudentSubmission, Tutor, TutorApplication, TutoringSession, MentorAssignment, Remark, OnDutyApplication, NoDuesCertificate, MarkStatus } from './types';

export const GRADE_POINTS: Record<Grade, number> = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'RA': 0,
    'SA': 0,
    'W': 0,
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
    [Permission.MANAGE_USERS]: 'Create, edit, and delete user accounts.',
    [Permission.VIEW_USERS]: 'View lists of users and their basic profiles.',
    [Permission.MANAGE_DEPARTMENTS]: 'Create, edit, and manage academic departments.',
    [Permission.VIEW_DEPARTMENTS]: 'View department information and structure.',
    [Permission.VIEW_LOGS]: 'Access system-wide activity logs.',
    [Permission.CONFIGURE_SYSTEM]: 'Change system-level settings and configurations.',
    [Permission.MANAGE_ALUMNI]: 'Manage the alumni database and records.',
    [Permission.PROMOTE_STUDENTS]: 'Promote students to the next year or graduate them.',
    [Permission.GENERATE_REPORTS]: 'Generate and export institutional reports.',
};

export let DEPARTMENTS: Department[] = [
    { id: 'd1', name: 'Computer Science' },
    { id: 'd2', name: 'Mechanical Engineering' },
    { id: 'd3', name: 'Civil Engineering' },
    { id: 'd4', name: 'Science & Humanities' },
];

export let USERS: (User | Student | Staff | Alumnus)[] = [
    // Admins
    { id: 'u1', name: 'Admin User', email: 'admin@lms.com', role: UserRole.ADMIN, status: StudentStatus.ACTIVE, dateJoined: '2020-01-15', permissions: [Permission.VIEW_USERS, Permission.MANAGE_USERS, Permission.MANAGE_DEPARTMENTS, Permission.VIEW_LOGS, Permission.CONFIGURE_SYSTEM, Permission.MANAGE_ALUMNI, Permission.GENERATE_REPORTS, Permission.PROMOTE_STUDENTS] },
    // Principals
    { id: 'u2', name: 'Dr. Evelyn Reed', email: 'principal@lms.com', role: UserRole.PRINCIPAL, status: StudentStatus.ACTIVE, dateJoined: '2015-06-20', permissions: [Permission.VIEW_USERS, Permission.VIEW_DEPARTMENTS, Permission.GENERATE_REPORTS] },
    // HODs
    { id: 'u3', name: 'Dr. Alan Grant', email: 'hod.cs@lms.com', role: UserRole.HOD, departmentId: 'd1', status: StudentStatus.ACTIVE, dateJoined: '2018-09-10', permissions: [Permission.VIEW_USERS] },
    { id: 'u4', name: 'Dr. Ian Malcolm', email: 'hod.mech@lms.com', role: UserRole.HOD, departmentId: 'd2', status: StudentStatus.ACTIVE, dateJoined: '2019-02-22', permissions: [Permission.VIEW_USERS] },
    // Staff
    { id: 'u5', name: 'Prof. Ellie Sattler', email: 'staff.cs1@lms.com', role: UserRole.STAFF, departmentId: 'd1', status: StudentStatus.ACTIVE, dateJoined: '2021-08-01', permissions: [] },
    { id: 'u6', name: 'Prof. Robert Muldoon', email: 'staff.cs2@lms.com', role: UserRole.STAFF, departmentId: 'd1', status: StudentStatus.ACTIVE, dateJoined: '2021-08-01', permissions: [] },
    { id: 'u7', name: 'Prof. John Hammond', email: 'staff.mech1@lms.com', role: UserRole.STAFF, departmentId: 'd2', status: StudentStatus.ACTIVE, dateJoined: '2021-08-01', permissions: [] },
    { id: 'u14', name: 'Dr. Sarah Harding', email: 'staff.sh1@lms.com', role: UserRole.HOD, departmentId: 'd4', status: StudentStatus.ACTIVE, dateJoined: '2022-01-05', permissions: [Permission.PROMOTE_STUDENTS] },
    // Students
    { id: 'u8', name: 'Alice Johnson', email: 'student.cs1@lms.com', role: UserRole.STUDENT, regNo: 'CS22001', section: 'A', admissionYear: 2022, departmentId: 'd1', year: 2, cgpa: 8.73, sgpa: [{ semester: 1, gpa: 8.43 }, { semester: 2, gpa: 9.0 }, { semester: 3, gpa: 9.0 }], status: StudentStatus.ACTIVE, dateJoined: '2022-08-15', permissions: [], phone: '9876543210', address: '123 Tech Park, Silicon Valley', photoUrl: 'https://i.pravatar.cc/150?u=u8', totalWorkingDays: 270, daysPresent: 255, dues: { library: true, department: true, accounts: true } },
    { id: 'u9', name: 'Bob Smith', email: 'student.cs2@lms.com', role: UserRole.STUDENT, regNo: 'CS21002', section: 'B', admissionYear: 2021, departmentId: 'd1', year: 3, cgpa: 8.59, sgpa: [{ semester: 1, gpa: 8.57 }, { semester: 2, gpa: 8.5 }, { semester: 3, gpa: 8.0 }, { semester: 4, gpa: 8.0 }, { semester: 5, gpa: 10.0 }], status: StudentStatus.ACTIVE, dateJoined: '2021-08-15', permissions: [], dues: { library: false, department: true, accounts: true } },
    { id: 'u15', name: 'Carol White', email: 'student.cs3@lms.com', role: UserRole.STUDENT, regNo: 'CS20003', section: 'A', admissionYear: 2020, departmentId: 'd1', year: 4, cgpa: 8.22, sgpa: [{ semester: 1, gpa: 7.57 }, { semester: 2, gpa: 8.0 }, { semester: 3, gpa: 8.0 }, { semester: 4, gpa: 9.0 }, { semester: 5, gpa: 9.0 }], status: StudentStatus.ACTIVE, dateJoined: '2020-08-15', permissions: [], dues: { library: true, department: true, accounts: true } },
    { id: 'u10', name: 'Charlie Brown', email: 'student.mech1@lms.com', role: UserRole.STUDENT, regNo: 'ME20001', section: 'A', admissionYear: 2020, departmentId: 'd2', year: 4, cgpa: 7.8, sgpa: [{ semester: 7, gpa: 7.0 }], status: StudentStatus.ACTIVE, dateJoined: '2020-08-15', permissions: [], dues: { library: true, department: true, accounts: true } },
    { id: 'u11', name: 'Diana Prince', email: 'student.mech2@lms.com', role: UserRole.STUDENT, regNo: 'ME22002', section: 'B', admissionYear: 2022, departmentId: 'd2', year: 2, cgpa: 9.21, sgpa: [{ semester: 1, gpa: 9.5 }, { semester: 2, gpa: 9.0 }, { semester: 3, gpa: 9.0 }], status: StudentStatus.ACTIVE, dateJoined: '2022-08-15', permissions: [], dues: { library: true, department: true, accounts: false } },
    { id: 'u16', name: 'Eve Adams', email: 'student.civil1@lms.com', role: UserRole.STUDENT, regNo: 'CE21001', section: 'A', admissionYear: 2021, departmentId: 'd3', year: 3, cgpa: 8.1, sgpa: [], status: StudentStatus.ACTIVE, dateJoined: '2021-08-15', permissions: [], dues: { library: true, department: true, accounts: true } },
    { id: 'u19', name: 'Mira', email: 'mira@lms.com', role: UserRole.STUDENT, regNo: 'CS21005', section: 'A', admissionYear: 2021, departmentId: 'd1', year: 3, cgpa: 9.67, sgpa: [{ semester: 1, gpa: 10.0 }, { semester: 2, gpa: 10.0 }, { semester: 3, gpa: 9.0 }], status: StudentStatus.ACTIVE, dateJoined: '2021-08-15', permissions: [], phone: '8765432109', address: '456 Innovation Drive, Cyber City', photoUrl: 'https://i.pravatar.cc/150?u=u19', totalWorkingDays: 90, daysPresent: 85, dues: { library: true, department: true, accounts: true } },
    // New First Year Students
    { id: 'u20', name: 'Frank Castle', email: 'sh.s1@lms.com', role: UserRole.STUDENT, regNo: 'SH23001', section: 'A', admissionYear: 2023, departmentId: 'd4', year: 1, cgpa: 8.9, sgpa: [{ semester: 1, gpa: 8.9 }], status: StudentStatus.ACTIVE, dateJoined: '2023-08-15', permissions: [], dues: { library: true, department: false, accounts: true } },
    { id: 'u21', name: 'Gwen Stacy', email: 'sh.s2@lms.com', role: UserRole.STUDENT, regNo: 'SH23002', section: 'B', admissionYear: 2023, departmentId: 'd4', year: 1, cgpa: 9.1, sgpa: [{ semester: 1, gpa: 9.1 }], status: StudentStatus.ACTIVE, dateJoined: '2023-08-15', permissions: [], dues: { library: true, department: true, accounts: true } },
    { id: 'u22', name: 'Harish Kumar', email: 'sh.s3@lms.com', role: UserRole.STUDENT, regNo: 'SH23003', section: 'A', admissionYear: 2023, departmentId: 'd4', year: 1, cgpa: 8.5, sgpa: [{ semester: 1, gpa: 8.5 }], status: StudentStatus.ACTIVE, dateJoined: '2023-08-15', permissions: [], dues: { library: true, department: true, accounts: true } },

    // Exam Cell
    { id: 'u12', name: 'Ray Arnold', email: 'examcell@lms.com', role: UserRole.EXAM_CELL, status: StudentStatus.ACTIVE, dateJoined: '2020-03-12', permissions: [Permission.VIEW_USERS, Permission.GENERATE_REPORTS] },
    // Alumni
    { id: 'u13', name: 'Peter Parker', email: 'alumni.cs1@lms.com', role: UserRole.STUDENT, status: StudentStatus.ALUMNI, regNo: 'CS2020001', section: 'A', admissionYear: 2020, year: 4, departmentId: 'd1', graduationYear: 2023, finalCgpa: 9.5, cgpa: 9.5, sgpa: [], job: 'Software Engineer', company: 'Google', location: 'Mountain View, CA', phone: 'peter.p@example.com', dateJoined: '2020-08-15', permissions: [], dues: { library: true, department: true, accounts: true } },
    { id: 'u17', name: 'Mary Jane Watson', email: 'alumni.cs2@lms.com', role: UserRole.STUDENT, status: StudentStatus.ALUMNI, regNo: 'CS2019002', section: 'A', admissionYear: 2019, year: 4, departmentId: 'd1', graduationYear: 2022, finalCgpa: 9.2, cgpa: 9.2, sgpa: [], job: 'Product Manager', company: 'Microsoft', location: 'Redmond, WA', phone: 'mj.w@example.com', dateJoined: '2019-08-15', permissions: [], dues: { library: true, department: true, accounts: true } },
    { id: 'u18', name: 'Harry Osborn', email: 'alumni.mech1@lms.com', role: UserRole.STUDENT, status: StudentStatus.ALUMNI, regNo: 'ME2020005', section: 'A', admissionYear: 2020, year: 4, departmentId: 'd2', graduationYear: 2023, finalCgpa: 8.8, cgpa: 8.8, sgpa: [], job: 'Mechanical Designer', company: 'Tesla', location: 'Austin, TX', phone: 'harry.o@example.com', dateJoined: '2020-08-15', permissions: [], dues: { library: true, department: true, accounts: true } }
];

export let STUDENTS: Student[] = USERS.filter(u => u.role === UserRole.STUDENT && (u as Student | Alumnus).status !== StudentStatus.ALUMNI) as Student[];
export let ALUMNI: Alumnus[] = USERS.filter(u => (u as Alumnus).status === StudentStatus.ALUMNI) as Alumnus[];
export let STAFF: Staff[] = USERS.filter(u => u.role === UserRole.STAFF || u.role === UserRole.HOD) as Staff[];

export let CLASSES: ClassInDepartment[] = [
    { departmentId: 'd1', year: 2, advisorId: 'u5' }, // CS 2nd year -> Prof. Ellie Sattler
    { departmentId: 'd1', year: 3, advisorId: 'u6' }, // CS 3rd year -> Prof. Robert Muldoon
    { departmentId: 'd1', year: 4, advisorId: 'u5' }, // CS 4th year -> Prof. Ellie Sattler
    { departmentId: 'd2', year: 2, advisorId: 'u7' }, // Mech 2nd year -> Prof. John Hammond
    { departmentId: 'd2', year: 4, advisorId: 'u7' }, // Mech 4th year -> Prof. John Hammond
    { departmentId: 'd3', year: 3, advisorId: 'u7' }, // Civil 3rd year -> Prof. John Hammond (Placeholder)
    { departmentId: 'd4', year: 1, advisorId: 'u14' }, // First Year 1st year -> Dr. Sarah Harding
];


export let COURSES: Course[] = [
    { id: 'c1', name: 'Data Structures', code: 'CS201', staffId: 'u5', departmentId: 'd1', credits: 4, semester: 3 },
    { id: 'c2', name: 'Algorithms', code: 'CS301', staffId: 'u6', departmentId: 'd1', credits: 4, semester: 5 },
    { id: 'c3', name: 'Thermodynamics', code: 'ME202', staffId: 'u7', departmentId: 'd2', credits: 4, semester: 3 },
    { id: 'c4', name: 'Machine Design', code: 'ME305', staffId: 'u7', departmentId: 'd2', credits: 3, semester: 5 },
    { id: 'c5', name: 'Physics I', code: 'SH101', staffId: 'u14', departmentId: 'd4', credits: 3, semester: 1 },
    // New Courses
    { id: 'c6', name: 'Programming in C', code: 'CS101', staffId: 'u5', departmentId: 'd1', credits: 4, semester: 1 },
    { id: 'c7', name: 'Object Oriented Programming', code: 'CS202', staffId: 'u6', departmentId: 'd1', credits: 4, semester: 2 },
    { id: 'c8', name: 'Database Management Systems', code: 'CS204', staffId: 'u6', departmentId: 'd1', credits: 4, semester: 4 },
    { id: 'c9', name: 'Engineering Graphics', code: 'ME101', staffId: 'u7', departmentId: 'd2', credits: 3, semester: 1 },
    { id: 'c10', name: 'Engineering Mechanics', code: 'ME201', staffId: 'u7', departmentId: 'd2', credits: 4, semester: 2 },
    { id: 'c11', name: 'Surveying', code: 'CE201', staffId: 'u7', departmentId: 'd3', credits: 4, semester: 3 }, // Placeholder staff for civil
    { id: 'c12', name: 'Fluid Mechanics', code: 'CE202', staffId: 'u7', departmentId: 'd3', credits: 4, semester: 4 }, // Placeholder staff for civil
];

export let MARKS: Mark[] = [
    // Marks for Alice Johnson (u8) - Corrected & Enriched
    { id: 'm1', courseId: 'c5', studentId: 'u8', semester: 1, internal: 42, exam: 78, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm2', courseId: 'c6', studentId: 'u8', semester: 1, internal: 40, exam: 70, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm3', courseId: 'c7', studentId: 'u8', semester: 2, internal: 46, exam: 85, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm4', courseId: 'c1', studentId: 'u8', semester: 3, internal: 45, exam: 80, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },

    // Marks for Bob Smith (u9) - Enriched
    { id: 'm5', courseId: 'c5', studentId: 'u9', semester: 1, internal: 40, exam: 80, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm6', courseId: 'c6', studentId: 'u9', semester: 1, internal: 45, exam: 88, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm7', courseId: 'c7', studentId: 'u9', semester: 2, internal: 38, exam: 70, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm8', courseId: 'c1', studentId: 'u9', semester: 3, internal: 40, exam: 75, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm9', courseId: 'c8', studentId: 'u9', semester: 4, internal: 41, exam: 78, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm10', courseId: 'c2', studentId: 'u9', semester: 5, internal: 48, exam: 90, grade: 'O', gradePoint: 10.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },

    // Marks for Charlie Brown (u10) - Unchanged
    { id: 'm11', courseId: 'c3', studentId: 'u10', semester: 7, internal: 35, exam: 60, grade: 'B+', gradePoint: 7.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },

    // Marks for Diana Prince (u11) - Corrected & Enriched
    { id: 'm12', courseId: 'c9', studentId: 'u11', semester: 1, internal: 45, exam: 90, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm13', courseId: 'c5', studentId: 'u11', semester: 1, internal: 48, exam: 92, grade: 'O', gradePoint: 10.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm14', courseId: 'c10', studentId: 'u11', semester: 2, internal: 42, exam: 84, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm15', courseId: 'c3', studentId: 'u11', semester: 3, internal: 42, exam: 85, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },

    // Marks for Carol White (u15) - New
    { id: 'm16', courseId: 'c5', studentId: 'u15', semester: 1, internal: 35, exam: 60, grade: 'B+', gradePoint: 7.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm17', courseId: 'c6', studentId: 'u15', semester: 1, internal: 38, exam: 68, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm18', courseId: 'c7', studentId: 'u15', semester: 2, internal: 40, exam: 72, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm19', courseId: 'c1', studentId: 'u15', semester: 3, internal: 39, exam: 75, grade: 'A', gradePoint: 8.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm20', courseId: 'c8', studentId: 'u15', semester: 4, internal: 42, exam: 80, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm21', courseId: 'c2', studentId: 'u15', semester: 5, internal: 44, exam: 85, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },

    // Marks for Mira (u19) - New
    { id: 'm22', courseId: 'c6', studentId: 'u19', semester: 1, internal: 47, exam: 94, grade: 'O', gradePoint: 10.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm23', courseId: 'c7', studentId: 'u19', semester: 2, internal: 46, exam: 90, grade: 'O', gradePoint: 10.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
    { id: 'm24', courseId: 'c1', studentId: 'u19', semester: 3, internal: 45, exam: 88, grade: 'A+', gradePoint: 9.0, status: MarkStatus.PUBLISHED, examCellVerified: true, hodVerified: true, principalVerified: true },
];

export let ATTENDANCE: Attendance[] = [
    // Existing attendance
    { courseId: 'c2', studentId: 'u9', date: '2023-10-01', present: true },
    { courseId: 'c3', studentId: 'u10', date: '2023-10-01', present: true },

    // New, enriched attendance for Alice Johnson (u8)
    // Course c1
    { courseId: 'c1', studentId: 'u8', date: '2023-10-01', present: true },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-02', present: false },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-03', present: true },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-04', present: true },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-05', present: true },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-06', present: true },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-09', present: false },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-10', present: true },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-11', present: true },
    { courseId: 'c1', studentId: 'u8', date: '2023-10-12', present: true },

    // Course c5
    { courseId: 'c5', studentId: 'u8', date: '2023-10-02', present: true },
    { courseId: 'c5', studentId: 'u8', date: '2023-10-03', present: true },
    { courseId: 'c5', studentId: 'u8', date: '2023-10-04', present: true },
    { courseId: 'c5', studentId: 'u8', date: '2023-10-05', present: false },
    { courseId: 'c5', studentId: 'u8', date: '2023-10-09', present: true },
    { courseId: 'c5', studentId: 'u8', date: '2023-10-10', present: true },
];

// FIX: Completed the ACTIVITY_LOGS array to match the ActivityLog type.
export let ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'l1', timestamp: '2023-10-26 10:00:00', user: 'Admin User', action: 'Logged In', ipAddress: '192.168.1.1', browser: 'Chrome' },
    { id: 'l2', timestamp: '2023-10-26 09:45:12', user: 'Dr. Alan Grant', action: 'Updated staff list for CS department', ipAddress: '203.0.113.25', browser: 'Safari' },
    { id: 'l3', timestamp: '2023-10-25 18:20:05', user: 'Prof. Ellie Sattler', action: 'Uploaded marks for CS201', ipAddress: '198.51.100.10', browser: 'Firefox' },
];

// FIX: Added missing NOTIFICATIONS constant.
export let NOTIFICATIONS: Notification[] = [
    { id: 'n1', type: 'Approval', message: 'New staff account for Prof. Davis needs approval.', timestamp: '2 hours ago', read: false },
    { id: 'n2', type: 'Alert', message: 'Database backup is scheduled for 2 AM tonight.', timestamp: '8 hours ago', read: false },
    { id: 'n3', type: 'Action', message: 'The exam cell account password will expire in 3 days.', timestamp: '1 day ago', read: false },
    { id: 'n4', type: 'Alert', message: 'System will be down for maintenance on Sunday.', timestamp: '2 days ago', read: true },
];

// FIX: Added missing ASSIGNMENTS constant.
export let ASSIGNMENTS: Assignment[] = [
    { id: 'a1', courseId: 'c1', title: 'Implement a Linked List', dueDate: '2023-11-10', submitted: false },
    { id: 'a2', courseId: 'c2', title: 'Analyze Sorting Algorithms', dueDate: '2023-11-15', submitted: true },
    { id: 'a3', courseId: 'c3', title: 'Solve Carnot Cycle Problems', dueDate: '2023-11-12', submitted: false },
];

// FIX: Added SUBMISSIONS constant.
export let SUBMISSIONS: StudentSubmission[] = [
    { assignmentId: 'a2', studentId: 'u8', submittedAt: '2023-11-14T10:00:00Z', status: 'Submitted', fileUrl: '/submissions/u8_a2.pdf', topic: "Analysis of Quicksort", remarks: "Good work, but check your complexity analysis for edge cases." },
    { assignmentId: 'a2', studentId: 'u9', submittedAt: '2023-11-15T11:00:00Z', status: 'Submitted', textSubmission: 'The complexity of bubble sort is O(n^2).', topic: "Analysis of Bubble Sort" },
    { assignmentId: 'a3', studentId: 'u10', submittedAt: '2023-11-13T12:00:00Z', status: 'Late', fileUrl: '/submissions/u10_a3.pdf' },
];

// FIX: Added missing MATERIALS constant.
export let MATERIALS: Material[] = [
    { id: 'm1', courseId: 'c1', title: 'Lecture 1 - Intro to DS', type: 'PDF', url: '/materials/ds_lec1.pdf', uploadedAt: '2023-10-01' },
    { id: 'm2', courseId: 'c1', title: 'Lecture 2 - Arrays', type: 'PPT', url: '/materials/ds_lec2.ppt', uploadedAt: '2023-10-08' },
    { id: 'm3', courseId: 'c2', title: 'Big O Notation Explained', type: 'Video Link', url: 'https://youtube.com/watch?v=some_video', uploadedAt: '2023-10-05' },
];

// FIX: Added missing BOOKS constant.
export let BOOKS: Book[] = [
    { id: 'b1', title: 'Data Structures and Algorithms', author: 'Narasimha Karumanchi', bookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', imageUrl: 'https://via.placeholder.com/300x400.png?text=DS+Cover' },
    { id: 'b2', title: 'Thermodynamics: An Engineering Approach', author: 'Yunus A. Çengel', bookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', imageUrl: 'https://via.placeholder.com/300x400.png?text=Thermo+Cover' },
    { id: 'b3', title: 'Structural Analysis', author: 'R.C. Hibbeler', bookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', imageUrl: 'https://via.placeholder.com/300x400.png?text=Civil+Cover' },
    { id: 'b4', title: 'Concepts of Modern Physics', author: 'Arthur Beiser', bookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', imageUrl: 'https://via.placeholder.com/300x400.png?text=Physics+Cover' },
    { id: 'b5', title: 'Clean Code', author: 'Robert C. Martin', bookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', imageUrl: 'https://via.placeholder.com/300x400.png?text=Code+Cover' },
    { id: 'b6', title: 'Design of Machine Elements', author: 'V. B. Bhandari', bookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', imageUrl: 'https://via.placeholder.com/300x400.png?text=Machine+Cover' },
];

// FIX: Added missing EXAM_SCHEDULES constant.
export let EXAM_SCHEDULES: ExamSchedule[] = [
    { id: 'es1', courseCode: 'CS201', courseName: 'Data Structures', date: '2023-12-10', time: '10:00 AM', duration: '3 Hours', hall: 'A-101' },
    { id: 'es2', courseCode: 'ME202', courseName: 'Thermodynamics', date: '2023-12-12', time: '10:00 AM', duration: '3 Hours', hall: 'B-205' },
    { id: 'es3', courseCode: 'CS301', courseName: 'Algorithms', date: '2023-12-15', time: '02:00 PM', duration: '3 Hours', hall: 'A-102' },
];

// FIX: Added missing DEPARTMENT_PASS_RATES constant.
export const DEPARTMENT_PASS_RATES = [
    { name: 'CompSci', passPercentage: 92 },
    { name: 'Mech', passPercentage: 88 },
    { name: 'Civil', passPercentage: 85 },
    { name: 'S & H', passPercentage: 95 },
];
// FIX: Added mock data for the Tutoring feature.
export let TUTORS: Tutor[] = [
    { id: 't1', studentId: 'u9', subjects: ['Algorithms', 'Data Structures'], rating: 4.8, bio: 'Expert in core CS concepts with a knack for breaking down complex problems.' },
    { id: 't2', studentId: 'u15', subjects: ['Machine Learning', 'AI'], rating: 4.9, bio: 'Passionate about AI and can help with both theory and practical projects.' },
];

export let TUTOR_APPLICATIONS: TutorApplication[] = [
    { id: 'ta1', studentId: 'u19', subjects: ['Web Development', 'React'], statement: 'I have built several projects with React and want to help others learn.', status: 'pending' },
];

export let TUTORING_SESSIONS: TutoringSession[] = [
    { id: 'ts1', tutorId: 't1', studentId: 'u8', subject: 'Algorithms', scheduledAt: '2023-11-20T14:00:00Z', status: 'upcoming' },
];

export let MENTOR_ASSIGNMENTS: MentorAssignment[] = [];
// Auto-assign mentors for mock data
DEPARTMENTS.forEach(dept => {
    const deptStudents = STUDENTS.filter(s => s.departmentId === dept.id);
    const deptFaculty = STAFF.filter(s => s.departmentId === dept.id);
    if (deptFaculty.length > 0) {
        let facultyIndex = 0;
        deptStudents.forEach(student => {
            MENTOR_ASSIGNMENTS.push({
                studentId: student.id,
                mentorId: deptFaculty[facultyIndex].id,
            });
            facultyIndex = (facultyIndex + 1) % deptFaculty.length;
        });
    }
});

export let REMARKS: Remark[] = [];

export let ON_DUTY_APPLICATIONS: OnDutyApplication[] = [
    { id: 'od1', applicantId: 'u8', reason: 'Participating in National Level Symposium at IIT Madras.', fromDate: '2023-10-15', toDate: '2023-10-17', type: 'OD', status: 'Approved', advisorApprovalId: 'u5', hodApprovalId: 'u3', appliedAt: '2023-10-10T10:00:00Z' },
    { id: 'od5', applicantId: 'u11', reason: 'Attending a workshop on Machine Learning.', fromDate: '2023-11-05', toDate: '2023-11-06', type: 'OD', status: 'Pending Advisor', appliedAt: '2023-11-01T14:30:00Z' },
    { id: 'od2', applicantId: 'u9', reason: 'Representing college at a technical fest.', fromDate: '2023-11-12', toDate: '2023-11-13', type: 'OD', status: 'Pending HOD', advisorApprovalId: 'u6', appliedAt: '2023-11-10T11:00:00Z' },
    { id: 'od3', applicantId: 'u8', reason: 'Family function.', fromDate: '2023-11-10', toDate: '2023-11-10', type: 'Leave', status: 'Rejected', rejectedById: 'u5', appliedAt: '2023-11-08T09:00:00Z' },
    { id: 'od4', applicantId: 'u6', reason: 'Attending faculty development program.', fromDate: '2023-11-20', toDate: '2023-11-21', type: 'OD', status: 'Pending HOD', appliedAt: '2023-11-18T10:00:00Z' },
    { id: 'od6', applicantId: 'u3', reason: 'Academic conference in Delhi.', fromDate: '2023-12-01', toDate: '2023-12-03', type: 'OD', status: 'Pending Principal', appliedAt: '2023-11-25T15:00:00Z' },
];

// FIX: Added missing constant for No Dues Certificates.
export let NO_DUES_CERTIFICATES: NoDuesCertificate[] = [];