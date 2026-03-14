import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Department, Course, Mark, Attendance, Material, ExamSchedule, Student, Staff, Alumnus, Assignment, Book, StudentSubmission, ClassInDepartment, Permission, Tutor, TutorApplication, TutoringSession, MentorAssignment, Remark, OnDutyApplication, NoDuesCertificate, DashboardAnalytics, StudentDocument, Notification } from '../../types';
import { RootState } from '../index';
import * as D from '../../constants';

export interface AppState {
    users: (User | Student | Staff | Alumnus)[];
    departments: Department[];
    courses: Course[];
    marks: Mark[];
    attendance: Attendance[];
    materials: Material[];
    examSchedules: ExamSchedule[];
    assignments: Assignment[];
    submissions: StudentSubmission[];
    classes: ClassInDepartment[];
    tutors: Tutor[];
    tutorApplications: TutorApplication[];
    tutoringSessions: TutoringSession[];
    mentorAssignments: MentorAssignment[];
    remarks: Remark[];
    onDutyApplications: OnDutyApplication[];
    // FIX: Add state for no dues certificates.
    noDuesCertificates: NoDuesCertificate[];
    notifications: Notification[];
    analytics: DashboardAnalytics | null;
    studentDocuments: StudentDocument[];
    pendingDocuments: StudentDocument[];
    books: Book[];
}

const initialState: AppState = {
    users: D.USERS,
    departments: D.DEPARTMENTS,
    courses: D.COURSES,
    marks: D.MARKS,
    attendance: D.ATTENDANCE,
    materials: D.MATERIALS,
    examSchedules: D.EXAM_SCHEDULES,
    assignments: D.ASSIGNMENTS,
    submissions: D.SUBMISSIONS,
    classes: D.CLASSES,
    tutors: D.TUTORS,
    tutorApplications: D.TUTOR_APPLICATIONS,
    tutoringSessions: D.TUTORING_SESSIONS,
    mentorAssignments: D.MENTOR_ASSIGNMENTS || [],
    remarks: D.REMARKS || [],
    onDutyApplications: D.ON_DUTY_APPLICATIONS || [],
    // FIX: Initialize state for no dues certificates.
    noDuesCertificates: D.NO_DUES_CERTIFICATES || [],
    notifications: D.NOTIFICATIONS,
    analytics: null,
    studentDocuments: [],
    pendingDocuments: [],
    books: D.BOOKS,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        // User Management
        addUserRequest: (state, action: PayloadAction<Omit<User, 'id' | 'permissions'>>) => {},
        // FIX: Update Omit type to allow 'phone' and omit 'dues' for bulk user creation.
        bulkAddUsersRequest: (state, action: PayloadAction<Omit<Student, 'id'|'permissions'|'cgpa'|'sgpa'|'totalWorkingDays'|'daysPresent'|'address'|'photoUrl'|'dues'>[]>) => {},
        transferStudentsRequest: (state, action: PayloadAction<{ studentIds: string[], newDepartmentId: string }>) => {},
        promoteClassRequest: (state, action: PayloadAction<{ departmentId: string; year: number }>) => {},
        updateUserInListRequest: (state, action: PayloadAction<User>) => {},
        bulkUpdateUsersStatusRequest: (state, action: PayloadAction<{ userIds: string[], status: 'Active' | 'Inactive' }>) => {},
        bulkPromoteStudentsRequest: (state, action: PayloadAction<{ userIds: string[] }>) => {},
        removeUserRequest: (state, action: PayloadAction<string>) => {},
        updateUserPermissionsRequest: (state, action: PayloadAction<{ userId: string, permissions: Permission[] }>) => {},
        fetchUsersRequest: (state) => {},
        setUsers: (state, action: PayloadAction<(User | Student | Staff | Alumnus)[]>) => {
            state.users = action.payload;
        },

        // Department Management
        addDepartmentRequest: (state, action: PayloadAction<string>) => {},
        fetchDepartmentsRequest: (state) => {},
        setDepartments: (state, action: PayloadAction<Department[]>) => {
            state.departments = action.payload;
        },
        assignHODRequest: (state, action: PayloadAction<{ deptId: string; staffId: string } | { deptId: string; newUser: { name: string; email: string; contact?: string } }>) => {},
        assignAdvisorRequest: (state, action: PayloadAction<{ departmentId: string; year: number; advisorId: string }>) => {},
        fetchClassesRequest: (state) => {},
        fetchCoursesRequest: (state) => {},
        setCourses: (state, action: PayloadAction<Course[]>) => {
            state.courses = action.payload;
        },
        fetchMarksRequest: (state) => {},
        setMarks: (state, action: PayloadAction<Mark[]>) => {
            state.marks = action.payload;
        },
        fetchAttendanceRequest: (state) => {},
        setAttendance: (state, action: PayloadAction<Attendance[]>) => {
            state.attendance = action.payload;
        },
        setClasses: (state, action: PayloadAction<ClassInDepartment[]>) => {
            state.classes = action.payload;
        },
        
        // Staff Actions
        submitAttendanceRequest: (state, action: PayloadAction<{ courseId: string; records: Record<string, boolean>}>) => {},
        saveMarksRequest: (state, action: PayloadAction<{ courseId: string; marks: Record<string, { internal?: number; exam?: number; }>}>) => {},
        verifyMarksRequest: (state, action: PayloadAction<{ markIds: string[] }>) => {},
        publishMarksRequest: (state, action: PayloadAction<{ courseId: string }>) => {},
        addMaterialRequest: (state, action: PayloadAction<Omit<Material, 'id' | 'uploadedAt'>>) => {},
        fetchMaterialsRequest: (state) => {},
        setMaterials: (state, action: PayloadAction<Material[]>) => {
            state.materials = action.payload;
        },
        addAssignmentRequest: (state, action: PayloadAction<Omit<Assignment, 'id' | 'submitted'>>) => {},
        bulkAssignTopicsRequest: (state, action: PayloadAction<{ courseId: string, assignments: { studentId: string, topic: string, remarks?: string }[] }>) => {},
        fetchAssignmentsRequest: (state) => {},
        setAssignments: (state, action: PayloadAction<Assignment[]>) => {
            state.assignments = action.payload;
        },
        submitAssignmentRequest: (state, action: PayloadAction<Omit<StudentSubmission, 'submittedAt' | 'status' | 'grade'>>) => {},
        gradeSubmissionRequest: (state, action: PayloadAction<{ studentId: string; assignmentId: string; grade: string; }>) => {},
        fetchSubmissionsRequest: (state) => {},
        setSubmissions: (state, action: PayloadAction<StudentSubmission[]>) => {
            state.submissions = action.payload;
        },

        // Exam Cell Actions
        addExamSchedulesRequest: (state, action: PayloadAction<ExamSchedule[]>) => {},
        fetchExamSchedulesRequest: (state) => {},
        setExamSchedules: (state, action: PayloadAction<ExamSchedule[]>) => {
            state.examSchedules = action.payload;
        },

        // FIX: Added actions for the Tutoring feature.
        // Tutoring Actions
        approveTutorApplicationRequest: (state, action: PayloadAction<string>) => {},
        bookTutoringSessionRequest: (state, action: PayloadAction<Omit<TutoringSession, 'id' | 'status'>>) => {},
        fetchTutorsRequest: (state) => {},
        setTutors: (state, action: PayloadAction<Tutor[]>) => {
            state.tutors = action.payload;
        },
        fetchTutorApplicationsRequest: (state) => {},
        setTutorApplications: (state, action: PayloadAction<TutorApplication[]>) => {
            state.tutorApplications = action.payload;
        },
        fetchTutoringSessionsRequest: (state) => {},
        setTutoringSessions: (state, action: PayloadAction<TutoringSession[]>) => {
            state.tutoringSessions = action.payload;
        },
        
        // Mentor/Advisor Actions
        autoAssignMenteesRequest: (state, action: PayloadAction<{ departmentId: string }>) => {},
        updateMentorAssignmentRequest: (state, action: PayloadAction<{ studentId: string; newMentorId: string }>) => {},
        bulkUpdateMentorAssignmentsRequest: (state, action: PayloadAction<{ studentIds: string[]; newMentorId: string }>) => {},
        addRemarkRequest: (state, action: PayloadAction<Omit<Remark, 'id' | 'timestamp'>>) => {},
        fetchMentorAssignmentsRequest: (state) => {},
        setMentorAssignments: (state, action: PayloadAction<MentorAssignment[]>) => {
            state.mentorAssignments = action.payload;
        },
        fetchRemarksRequest: (state) => {},
        setRemarks: (state, action: PayloadAction<Remark[]>) => {
            state.remarks = action.payload;
        },

        // OD Actions
        applyForODRequest: (state, action: PayloadAction<Omit<OnDutyApplication, 'id' | 'status' | 'appliedAt' | 'advisorApprovalId' | 'hodApprovalId' | 'principalApprovalId' | 'rejectedById'>>) => {},
        processODRequest: (state, action: PayloadAction<{ applicationId: string; decision: 'approve' | 'reject'; }>) => {},
        updateODApplicationRequest: (state, action: PayloadAction<Partial<OnDutyApplication> & { id: string }>) => {},
        fetchOnDutyApplicationsRequest: (state) => {},
        setOnDutyApplications: (state, action: PayloadAction<OnDutyApplication[]>) => {
            state.onDutyApplications = action.payload;
        },

        // FIX: Added actions for Dues Management and No Dues Certificates.
        // Dues Actions
        updateDuesStatusRequest: (state, action: PayloadAction<{ studentId: string, dueType: 'library' | 'department' | 'accounts', status: boolean }>) => {},
        issueNoDuesCertificateRequest: (state, action: PayloadAction<string>) => {},
        fetchNoDuesCertificatesRequest: (state) => {},
        setNoDuesCertificates: (state, action: PayloadAction<NoDuesCertificate[]>) => {
            state.noDuesCertificates = action.payload;
        },

        // Analytics
        fetchAnalyticsRequest: (state) => {},
        setAnalytics: (state, action: PayloadAction<DashboardAnalytics>) => {
            state.analytics = action.payload;
        },

        // Documents
        uploadDocumentRequest: (state, action: PayloadAction<{ title: string, fileUrl: string }>) => {},
        fetchStudentDocumentsRequest: (state) => {},
        setStudentDocuments: (state, action: PayloadAction<StudentDocument[]>) => {
            // Can be used for student viewing their own, or admin viewing specific student
            state.studentDocuments = action.payload; 
        },
        fetchPendingDocumentsRequest: (state) => {},
        setPendingDocuments: (state, action: PayloadAction<StudentDocument[]>) => {
            state.pendingDocuments = action.payload;
        },
        verifyDocumentRequest: (state, action: PayloadAction<{ documentId: string, status: 'Verified' | 'Rejected', remarks?: string }>) => {},

        // Notifications
        fetchNotificationsRequest: (state) => {},
        setNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
        },
        markNotificationReadRequest: (state, action: PayloadAction<string>) => {},
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications = [action.payload, ...state.notifications].slice(0, 20); // Keep last 20
        },

        // Library Actions
        fetchBooksRequest: (state) => {},
        setBooks: (state, action: PayloadAction<Book[]>) => {
            state.books = action.payload;
        },
        addBookRequest: (state, action: PayloadAction<Omit<Book, 'id'>>) => {},
        deleteBookRequest: (state, action: PayloadAction<string>) => {},
    }
});

export const {
    addUserRequest,
    bulkAddUsersRequest,
    transferStudentsRequest,
    promoteClassRequest,
    updateUserInListRequest,
    bulkUpdateUsersStatusRequest,
    bulkPromoteStudentsRequest,
    removeUserRequest,
    updateUserPermissionsRequest,
    fetchUsersRequest,
    setUsers,
    addDepartmentRequest,
    fetchDepartmentsRequest,
    setDepartments,
    assignHODRequest,
    assignAdvisorRequest,
    fetchClassesRequest,
    fetchCoursesRequest,
    setCourses,
    fetchMarksRequest,
    setMarks,
    fetchAttendanceRequest,
    setAttendance,
    setClasses,
    submitAttendanceRequest,
    saveMarksRequest,
    verifyMarksRequest,
    publishMarksRequest,
    addMaterialRequest,
    fetchMaterialsRequest,
    setMaterials,
    addAssignmentRequest,
    bulkAssignTopicsRequest,
    fetchAssignmentsRequest,
    setAssignments,
    submitAssignmentRequest,
    gradeSubmissionRequest,
    fetchSubmissionsRequest,
    setSubmissions,
    addExamSchedulesRequest,
    fetchExamSchedulesRequest,
    setExamSchedules,
    approveTutorApplicationRequest,
    bookTutoringSessionRequest,
    fetchTutorsRequest,
    setTutors,
    fetchTutorApplicationsRequest,
    setTutorApplications,
    fetchTutoringSessionsRequest,
    setTutoringSessions,
    autoAssignMenteesRequest,
    updateMentorAssignmentRequest,
    bulkUpdateMentorAssignmentsRequest,
    addRemarkRequest,
    fetchMentorAssignmentsRequest,
    setMentorAssignments,
    fetchRemarksRequest,
    setRemarks,
    applyForODRequest,
    processODRequest,
    updateODApplicationRequest,
    fetchOnDutyApplicationsRequest,
    setOnDutyApplications,
    updateDuesStatusRequest,
    issueNoDuesCertificateRequest,
    fetchNoDuesCertificatesRequest,
    setNoDuesCertificates,
    fetchAnalyticsRequest,
    setAnalytics,
    uploadDocumentRequest,
    fetchStudentDocumentsRequest,
    setStudentDocuments,
    fetchPendingDocumentsRequest,
    setPendingDocuments,
    verifyDocumentRequest,
    fetchNotificationsRequest,
    setNotifications,
    markNotificationReadRequest,
    addNotification,
    fetchBooksRequest,
    setBooks,
    addBookRequest,
    deleteBookRequest,
} = appSlice.actions;

// Selectors
export const selectAllUsers = (state: RootState) => state.app.users;
export const selectAllDepartments = (state: RootState) => state.app.departments;
export const selectAllCourses = (state: RootState) => state.app.courses;
export const selectAllMarks = (state: RootState) => state.app.marks;
export const selectAllAttendance = (state: RootState) => state.app.attendance;
export const selectAllMaterials = (state: RootState) => state.app.materials;
export const selectAllExamSchedules = (state: RootState) => state.app.examSchedules;
export const selectAllAssignments = (state: RootState) => state.app.assignments;
export const selectAllSubmissions = (state: RootState) => state.app.submissions;
export const selectAllClasses = (state: RootState) => state.app.classes;
export const selectAllTutors = (state: RootState) => state.app.tutors;
export const selectAllTutorApplications = (state: RootState) => state.app.tutorApplications;
export const selectAllTutoringSessions = (state: RootState) => state.app.tutoringSessions;
export const selectAllMentorAssignments = (state: RootState) => state.app.mentorAssignments;
export const selectAllRemarks = (state: RootState) => state.app.remarks;
export const selectAllODApplications = (state: RootState) => state.app.onDutyApplications;
// FIX: Add selector for No Dues Certificates.
export const selectAllNoDuesCertificates = (state: RootState) => state.app.noDuesCertificates;
export const selectAnalytics = (state: RootState) => state.app.analytics;
export const selectStudentDocuments = (state: RootState) => state.app.studentDocuments;
export const selectPendingDocuments = (state: RootState) => state.app.pendingDocuments;
export const selectNotifications = (state: RootState) => state.app.notifications;
export const selectAllBooks = (state: RootState) => state.app.books;


export default appSlice.reducer;
