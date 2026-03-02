


export enum UserRole {
  ADMIN = 'ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  HOD = 'HOD',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
  EXAM_CELL = 'EXAM_CELL',
}

export enum StudentStatus {
    ACTIVE = 'Active',
    ALUMNI = 'Alumni',
    INACTIVE = 'Inactive',
}

export enum Permission {
  // User Permissions
  MANAGE_USERS = 'users:manage',
  VIEW_USERS = 'users:view',
  
  // Department Permissions
  MANAGE_DEPARTMENTS = 'departments:manage',
  VIEW_DEPARTMENTS = 'departments:view',

  // System Permissions
  VIEW_LOGS = 'logs:view',
  CONFIGURE_SYSTEM = 'system:configure',

  // Student/Alumni Permissions
  MANAGE_ALUMNI = 'alumni:manage',
  PROMOTE_STUDENTS = 'students:promote',

  // Reporting
  GENERATE_REPORTS = 'reports:generate',
}

export type Grade = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'RA' | 'SA' | 'W';


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  status: StudentStatus;
  phone?: string;
  address?: string;
  photoUrl?: string;
  permissions: Permission[];
  dues?: {
      library: boolean;
      department: boolean;
      accounts: boolean;
  };
}

export interface Department {
    id: string;
    name: string;
}

export interface ClassInDepartment {
    departmentId: string;
    year: number;
    advisorId: string;
}

export interface Course {
    id: string;
    name: string;
    code: string;
    staffId: string;
    departmentId: string;
    credits: number;
    semester: number;
}

export interface Mark {
    courseId: string;
    studentId: string;
    semester: number;
    internal: number;
    exam: number;
    grade: Grade;
    gradePoint: number;
}

export interface Attendance {
    courseId: string;
    studentId: string;
    date: string;
    present: boolean;
}

export interface Student extends User {
    role: UserRole.STUDENT;
    regNo: string;
    section: string;
    admissionYear: number;
    year: number;
    cgpa: number;
    sgpa: { semester: number, gpa: number }[];
    status: StudentStatus.ACTIVE | StudentStatus.INACTIVE;
    totalWorkingDays?: number;
    daysPresent?: number;
    dues: {
        library: boolean;
        department: boolean;
        accounts: boolean;
    };
}

export interface Alumnus extends User {
    role: UserRole.STUDENT;
    status: StudentStatus.ALUMNI;
    regNo: string;
    section: string;
    admissionYear: number;
    year: number;
    cgpa: number;
    sgpa: { semester: number, gpa: number }[];
    graduationYear: number;
    finalCgpa: number;
    job?: string;
    company?: string;
    location?: string;
    dues: {
        library: boolean;
        department: boolean;
        accounts: boolean;
    };
}

export interface Staff extends User {
    role: UserRole.STAFF | UserRole.HOD;
}

export interface ActivityLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    ipAddress: string;
    browser: string;
}

export interface Reminder {
    id: string;
    text: string;
}

export interface TodaysClass {
    id: string;
    name: string;
    time: string;
}

export interface UpcomingEvent {
    id: string;
    type: 'Mandatory' | 'Optional';
    title: string;
    date: string;
    time: string;
}

export interface Notification {
    id: string;
    type: 'Approval' | 'Alert' | 'Action';
    message: string;
    timestamp: string;
    read: boolean;
}

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    dueDate: string;
    submitted: boolean;
}

export interface Material {
    id: string;
    courseId: string;
    title: string;
    type: 'PDF' | 'PPT' | 'Video Link';
    url: string;
    uploadedAt: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    coverUrl: string;
}

export interface ExamSchedule {
    id: string;
    courseCode: string;
    courseName: string;
    date: string;
    time: string;
    duration: string;
    hall: string;
}
export interface StudentSubmission {
    assignmentId: string;
    studentId: string;
    submittedAt: string; // ISO date string
    fileUrl?: string; // Path to submitted file
    textSubmission?: string;
    status: 'Submitted' | 'Late' | 'Not Submitted' | 'Graded';
    grade?: string;
    topic?: string;
    remarks?: string;
}
export interface Tutor {
    id: string;
    studentId: string;
    subjects: string[];
    rating: number;
    bio: string;
}

export interface TutorApplication {
    id: string;
    studentId: string;
    subjects: string[];
    statement: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface TutoringSession {
    id: string;
    tutorId: string;
    studentId: string;
    subject: string;
    scheduledAt: string; // ISO date string
    status: 'upcoming' | 'completed' | 'cancelled';
}

export interface MentorAssignment {
  studentId: string;
  mentorId: string;
}

export interface Remark {
  id: string;
  studentId: string;
  mentorId: string;
  text: string;
  timestamp: string;
}

export interface OnDutyApplication {
    id: string;
    applicantId: string;
    reason: string;
    fromDate: string;
    toDate: string;
    type: 'OD' | 'Leave';
    status: 'Pending Advisor' | 'Pending HOD' | 'Pending Principal' | 'Approved' | 'Rejected';
    advisorApprovalId?: string;
    hodApprovalId?: string;
    principalApprovalId?: string;
    rejectedById?: string;
    appliedAt: string;
}

export interface NoDuesCertificate {
    id: string;
    studentId: string;
    status: 'Requested' | 'Issued';
    issuedAt?: string;
}

export interface DashboardAnalytics {
    overview: {
        totalStudents: number;
        totalStaff: number;
        totalCourses: number;
        totalDepartments: number;
        attendancePercentage?: number;
    };
    studentDistribution: { name: string; count: number }[];
}

export interface StudentDocument {
    id: string;
    studentId: string;
    title: string;
    fileUrl: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    remarks?: string;
    uploadedAt: string;
    verifiedAt?: string;
    verifiedBy?: string;
    user?: {
         name: string;
         email: string;
    }
}