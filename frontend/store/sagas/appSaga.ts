import * as sagaEffects from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import * as D from '../../constants';
import { User, Department, Course, UserRole, StudentStatus, Permission, Staff, Material, Mark, Attendance, ExamSchedule, Student, Alumnus, Assignment, Grade, StudentSubmission, ClassInDepartment, Tutor, TutorApplication, TutoringSession, MentorAssignment, Remark, OnDutyApplication, NoDuesCertificate } from '../../types';
import {
    addUserRequest,
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
    fetchCoursesRequest,
    setCourses,
    fetchMarksRequest,
    setMarks,
    fetchAttendanceRequest,
    setAttendance,
    setClasses,
    submitAttendanceRequest,
    saveMarksRequest,
    addMaterialRequest,
    fetchMaterialsRequest,
    setMaterials,
    addAssignmentRequest,
    bulkAssignTopicsRequest,
    setAssignments,
    submitAssignmentRequest,
    gradeSubmissionRequest,
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
    bulkAddUsersRequest,
    transferStudentsRequest,
    promoteClassRequest,
    updateDuesStatusRequest,
    issueNoDuesCertificateRequest,
    fetchNoDuesCertificatesRequest,
    setNoDuesCertificates,
    fetchAssignmentsRequest,
    fetchSubmissionsRequest,
    fetchAnalyticsRequest,
    setAnalytics,
    uploadDocumentRequest,
    fetchStudentDocumentsRequest,
    setStudentDocuments,
    fetchPendingDocumentsRequest,
    setPendingDocuments,
    verifyDocumentRequest,
} from '../slices/appSlice';
import { DashboardAnalytics, StudentDocument } from '../../types';
import { selectUser } from '../slices/authSlice';
import { showToast } from '../slices/uiSlice';

const BASE_URL = 'https://nitcampuz-production.up.railway.app'; // Fixed production URL

// --- HELPER FUNCTIONS ---
function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

const calculateGradeAndPoints = (internal: number, exam: number): { grade: Grade, gradePoint: number } => {
    const total = internal + (exam / 2); // Total out of 100
    if (total >= 91) return { grade: 'O', gradePoint: 10.0 };
    if (total >= 81) return { grade: 'A+', gradePoint: 9.0 };
    if (total >= 71) return { grade: 'A', gradePoint: 8.0 };
    if (total >= 61) return { grade: 'B+', gradePoint: 7.0 };
    if (total >= 51) return { grade: 'B', gradePoint: 6.0 };
    if (total >= 50) return { grade: 'C', gradePoint: 5.0 };
    return { grade: 'RA', gradePoint: 0.0 };
};


// --- FETCH DATA SAGAS ---

function* handleFetchUsers() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: User[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setUsers(data));
        } else {
            console.error('Failed to fetch users');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function* handleFetchDepartments() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/departments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Department[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setDepartments(data));
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
    }
}

function* handleFetchCourses() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Course[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setCourses(data));
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

function* handleFetchMarks() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/marks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Mark[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setMarks(data));
        }
    } catch (error) {
        console.error('Error fetching marks:', error);
    }
}

function* handleFetchAttendance() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/attendance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Attendance[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setAttendance(data));
        }
    } catch (error) {
        console.error('Error fetching attendance:', error);
    }
}

function* handleFetchMaterials() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/materials`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Material[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setMaterials(data));
        }
    } catch (error) {
        console.error('Error fetching materials:', error);
    }
}

function* handleFetchExamSchedules() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/exam-schedules`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: ExamSchedule[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setExamSchedules(data));
        }
    } catch (error) {
        console.error('Error fetching exam schedules:', error);
    }
}

function* handleFetchMentorAssignments() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/mentoring/assignments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: MentorAssignment[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setMentorAssignments(data));
        }
    } catch (error) {
        console.error('Error fetching mentor assignments:', error);
    }
}

function* handleFetchRemarks() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/mentoring/remarks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Remark[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setRemarks(data));
        }
    } catch (error) {
        console.error('Error fetching remarks:', error);
    }
}

function* handleFetchTutors() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/tutoring/tutors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Tutor[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setTutors(data));
        }
    } catch (error) {
        console.error('Error fetching tutors:', error);
    }
}

function* handleFetchOnDutyApplications() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/on-duty`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: OnDutyApplication[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setOnDutyApplications(data));
        }
    } catch (error) {
        console.error('Error fetching OD applications:', error);
    }
}

function* handleFetchNoDuesCertificates() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/no-dues`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: { certificates: NoDuesCertificate[], dues: any[] } = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setNoDuesCertificates(data.certificates));
        }
    } catch (error) {
        console.error('Error fetching no dues certificates:', error);
    }
}

function* handleFetchTutorApplications() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/tutoring/applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: TutorApplication[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setTutorApplications(data));
        }
    } catch (error) {
        console.error('Error fetching tutor applications:', error);
    }
}

function* handleFetchTutoringSessions() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/tutoring/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: TutoringSession[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setTutoringSessions(data));
        }
    } catch (error) {
        console.error('Error fetching tutoring sessions:', error);
    }
}

function* handleFetchAssignments() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/assignments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: Assignment[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setAssignments(data));
        }
    } catch (error) {
        console.error('Error fetching assignments:', error);
    }
}

function* handleFetchSubmissions() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/assignments/submissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: StudentSubmission[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setSubmissions(data));
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
    }
}

// --- ANALYTICS SAGAS ---

function* handleFetchAnalytics() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: DashboardAnalytics = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setAnalytics(data));
        } else {
             console.error('Failed to fetch analytics.');
        }
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
}

// --- USER MANAGEMENT SAGAS ---

function* handleAddUser(action: PayloadAction<Omit<User, 'id' | 'permissions'>>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'User added successfully.' }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to add user.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to add user.' }));
        }
    }
}

function* handleBulkAddUsers(action: PayloadAction<Omit<Student, 'id'|'permissions'|'cgpa'|'sgpa'|'totalWorkingDays'|'daysPresent'|'address'|'photoUrl'|'dues'>[]>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            const data: { message: string } = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(showToast({ type: 'success', message: data.message }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to perform bulk upload.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to perform bulk upload.' }));
        }
    }
}

function* handleTransferStudents(action: PayloadAction<{ studentIds: string[], newDepartmentId: string }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Students transferred successfully.' }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to transfer students.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to transfer students.' }));
        }
    }
}

function* handlePromoteClass(action: PayloadAction<{ departmentId: string; year: number }>) {
    try {
        const { departmentId, year } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/promote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ departmentId, year }),
        });

        if (response.ok) {
            const data: { message: string } = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(showToast({ type: 'success', message: data.message }));
            // To be fully functional, we should dispatch a fetch users action here,
            // but for now we'll rely on page reload or existing data flow.
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to promote class.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to promote class.' }));
        }
    }
}


function* handleUpdateUserInList(action: PayloadAction<User>) {
    try {
        const { id, ...updates } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'User updated successfully.' }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to update user.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to update user.' }));
        }
    }
}

function* handleBulkUpdateUsersStatus(action: PayloadAction<{ userIds: string[], status: 'Active' | 'Inactive' }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'User statuses updated.' }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to update statuses.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to update statuses.' }));
        }
    }
}

function* handleBulkPromoteStudents(action: PayloadAction<{ userIds: string[] }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/bulk-promote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Students promoted successfully.' }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to promote students.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to promote students.' }));
        }
    }
}


function* handleRemoveUser(action: PayloadAction<string>) {
    try {
        const id = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'User removed successfully.' }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to remove user.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to remove user.' }));
        }
    }
}

function* handleUpdateUserPermissions(action: PayloadAction<{ userId: string; permissions: Permission[] }>) {
  try {
    const { userId, permissions } = action.payload;
    const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

    const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permissions }),
    });

    if (response.ok) {
        const data: { permissions: Permission[] } = yield sagaEffects.call([response, 'json']);
        
        // Update local state copy to reflect UI changes instantly
        const currentUsers: User[] = yield sagaEffects.select((state: any) => state.app.users);
        const userIndex = currentUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const newUsers = [...currentUsers];
            newUsers[userIndex] = { ...newUsers[userIndex], permissions: data.permissions };
            yield sagaEffects.put(setUsers(newUsers));
        }

        yield sagaEffects.put(showToast({ type: 'success', message: 'User permissions updated successfully.' }));
    } else {
        const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
        throw new Error(errorData.message || 'Failed to update permissions.');
    }
  } catch (error) {
    if (error instanceof Error) {
        yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
    } else {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to update permissions.' }));
    }
  }
}

// --- DEPARTMENT MANAGEMENT SAGAS ---

function* handleAddDepartment(action: PayloadAction<string>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/departments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: action.payload }),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Department created successfully.' }));
            yield sagaEffects.put(fetchDepartmentsRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to create department.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to create department.' }));
        }
    }
}

function* handleAssignHOD(action: PayloadAction<{ deptId: string; staffId: string } | { deptId: string; newUser: { name: string; email: string; contact?: string } }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        
        let body;
        if ('staffId' in action.payload) {
            body = action.payload;
        } else {
            // Simplified: for now only handle existing staff assignment
            // In a real app we'd create the user first
            yield sagaEffects.put(showToast({ type: 'error', message: 'Creating new user during HOD assignment not implemented yet.' }));
            return;
        }

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/assign-hod`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'HOD assigned successfully.' }));
            yield sagaEffects.put(fetchUsersRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to assign HOD.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to assign HOD.' }));
        }
    }
}

function* handleAssignAdvisor(action: PayloadAction<{ departmentId: string; year: number; advisorId: string }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/assign-advisor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Class advisor assigned successfully.' }));
            // Note: Classes don't have a fetch action yet, but we update them locally or wait for reload
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to assign class advisor.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to assign class advisor.' }));
        }
    }
}

// --- STAFF SAGAS ---

function* handleSubmitAttendance(action: PayloadAction<{ courseId: string; records: Record<string, boolean>}>) {
    try {
        const { courseId, records } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ courseId, records }),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Attendance submitted successfully.' }));
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to submit attendance.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to submit attendance.' }));
        }
    }
}

function* handleSaveMarks(action: PayloadAction<{ courseId: string; marks: Record<string, { internal?: number; exam?: number; }>}>) {
    try {
        const { courseId, marks } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/marks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ courseId, marks }),
        });

        if (response.ok) {
            // Need to refetch users/marks here to update Redux store on success
            // For now just show success, the frontend currently reloads data on mount
            yield sagaEffects.put(showToast({ type: 'success', message: 'Marks saved successfully.' }));
        } else {
            const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
            throw new Error(errorData.message || 'Failed to save marks.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to save marks.' }));
        }
    }
}

function* handleAddMaterial(action: PayloadAction<Omit<Material, 'id' | 'uploadedAt'>>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/academic/materials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Material added successfully.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to add material.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to add material.' }));
        }
    }
}



function* handleAddAssignment(action: PayloadAction<Omit<Assignment, 'id' | 'submitted'>>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Assignment added successfully.' }));
            // Ideally refetch assignments here to keep UI exactly in sync
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to add assignment.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
             yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to add assignment.' }));
        }
    }
}

function* handleBulkAssignTopics(action: PayloadAction<{ courseId: string; assignments: { studentId: string, topic: string, remarks?: string }[] }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/assignments/bulk-assign-topics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Topics assigned successfully.' }));
            yield sagaEffects.put(fetchSubmissionsRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to assign topics.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to assign topics.' }));
        }
    }
}

function* handleSubmitAssignment(action: PayloadAction<Omit<StudentSubmission, 'submittedAt' | 'status' | 'grade'>>) {
    try {
        const { assignmentId, ...submissionData } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/assignments/${assignmentId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(submissionData),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Assignment submitted successfully.' }));
            // Frontend will reload on mount to see changes
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to submit assignment.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
             yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to submit assignment.' }));
        }
    }
}

function* handleGradeSubmission(action: PayloadAction<{ studentId: string; assignmentId: string; grade: string; }>) {
    try {
        const { studentId, assignmentId, grade } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/assignments/grade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ studentId, assignmentId, grade }),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Submission graded successfully.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to grade submission.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
             yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to grade submission.' }));
        }
    }
}

// --- EXAM CELL SAGAS ---

function* handleAddExamSchedules(action: PayloadAction<ExamSchedule[]>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        
        yield sagaEffects.all(action.payload.map(schedule => 
             sagaEffects.call(fetch, `${BASE_URL}/api/academic/exam-schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(schedule),
            })
        ));

        yield sagaEffects.put(showToast({ type: 'success', message: 'Exam schedules added successfully.' }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to add exam schedules.' }));
    }
}

// --- TUTORING SAGAS ---

function* handleApproveTutorApplication(action: PayloadAction<string>) {
    try {
        const applicationId = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/tutoring/applications/${applicationId}/approve`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Tutor application approved.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to approve application.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to approve application.' }));
        }
    }
}

function* handleBookTutoringSession(action: PayloadAction<Omit<TutoringSession, 'id' | 'status'>>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/tutoring/sessions`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Tutoring session booked.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to book session.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to book session.' }));
        }
    }
}

// --- MENTORING SAGAS ---

function* handleAutoAssignMentees(action: PayloadAction<{ departmentId: string }>) {
    try {
        const { departmentId } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/mentoring/assignments/auto-assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ departmentId }),
        });

        if (response.ok) {
            const data: { assignments: MentorAssignment[] } = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setMentorAssignments(data.assignments));
            yield sagaEffects.put(showToast({ type: 'success', message: 'Mentees have been auto-assigned.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to auto-assign mentees.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to auto-assign mentees.' }));
        }
    }
}

function* handleUpdateMentorAssignment(action: PayloadAction<{ studentId: string; newMentorId: string }>) {
    try {
        const { studentId, newMentorId } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/mentoring/assignments`, {
             method: 'PUT',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ studentId, newMentorId }),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Mentor re-assigned successfully.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to re-assign mentor.');
        }
    } catch (error) {
        if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to re-assign mentor.' }));
        }
    }
}

function* handleAddRemark(action: PayloadAction<Omit<Remark, 'id' | 'timestamp'>>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/mentoring/remarks`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Remark added successfully.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to add remark.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to add remark.' }));
        }
    }
}

// --- OD/LEAVE SAGAS ---

function* handleApplyForOD(action: PayloadAction<Omit<OnDutyApplication, 'id' | 'status' | 'appliedAt' | 'advisorApprovalId' | 'hodApprovalId' | 'principalApprovalId' | 'rejectedById'>>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/on-duty/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Application submitted successfully.' }));
            yield sagaEffects.put(fetchOnDutyApplicationsRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to submit application.');
        }
    } catch (error) {
         console.error("OD Submission Error:", error);
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to submit application. Please check your connection.' }));
        }
    }
}

function* handleProcessOD(action: PayloadAction<{ applicationId: string; decision: 'approve' | 'reject'; }>) {
    try {
        const { applicationId, decision } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/on-duty/${applicationId}/process`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ decision }),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Application processed.' }));
            yield sagaEffects.put(fetchOnDutyApplicationsRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to process application.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to process application.' }));
        }
    }
}

function* handleUpdateODApplication(action: PayloadAction<Partial<OnDutyApplication> & { id: string }>) {
    try {
        const { id, ...updates } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/on-duty/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Application updated successfully.' }));
            yield sagaEffects.put(fetchOnDutyApplicationsRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to update application.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to update application.' }));
        }
    }
}


// --- DUES SAGAS ---

function* handleUpdateDuesStatus(action: PayloadAction<{ studentId: string; dueType: 'library' | 'department' | 'accounts'; status: boolean; }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/no-dues/update-dues`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Dues status updated.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to update dues.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to update dues.' }));
        }
    }
}

function* handleIssueNoDuesCertificate(action: PayloadAction<string>) {
    try {
        const studentId = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/admin/no-dues/issue`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ studentId }),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'No Dues Certificate issued.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to issue certificate.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to issue certificate.' }));
        }
    }
}

// --- DOCUMENT SAGAS ---

function* handleUploadDocument(action: PayloadAction<{ title: string, fileUrl: string }>) {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/documents/upload`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Document uploaded successfully.' }));
            yield sagaEffects.put(fetchStudentDocumentsRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to upload document.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to upload document.' }));
        }
    }
}

function* handleFetchStudentDocuments() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/documents/my-documents`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: StudentDocument[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setStudentDocuments(data));
        }
    } catch (error) {
        console.error('Error fetching student documents:', error);
    }
}

function* handleFetchPendingDocuments() {
    try {
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        if (!token) return;

        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/documents/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data: StudentDocument[] = yield sagaEffects.call([response, 'json']);
            yield sagaEffects.put(setPendingDocuments(data));
        }
    } catch (error) {
        console.error('Error fetching pending documents:', error);
    }
}

function* handleVerifyDocument(action: PayloadAction<{ documentId: string, status: 'Verified' | 'Rejected', remarks?: string }>) {
    try {
        const { documentId, ...verifyData } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `${BASE_URL}/api/documents/${documentId}/verify`, {
             method: 'PUT',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(verifyData),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: `Document ${verifyData.status.toLowerCase()} successfully.` }));
            yield sagaEffects.put(fetchPendingDocumentsRequest());
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to verify document.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to verify document.' }));
        }
    }
}


// --- WATCHER SAGA ---

function* appSaga() {
  yield sagaEffects.takeLatest(addUserRequest.type, handleAddUser);
  yield sagaEffects.takeLatest(bulkAddUsersRequest.type, handleBulkAddUsers);
  yield sagaEffects.takeLatest(transferStudentsRequest.type, handleTransferStudents);
  yield sagaEffects.takeLatest(promoteClassRequest.type, handlePromoteClass);
  yield sagaEffects.takeLatest(updateUserInListRequest.type, handleUpdateUserInList);
  yield sagaEffects.takeLatest(bulkUpdateUsersStatusRequest.type, handleBulkUpdateUsersStatus);
  yield sagaEffects.takeLatest(bulkPromoteStudentsRequest.type, handleBulkPromoteStudents);
  yield sagaEffects.takeLatest(removeUserRequest.type, handleRemoveUser);
  yield sagaEffects.takeLatest(updateUserPermissionsRequest.type, handleUpdateUserPermissions);
  yield sagaEffects.takeLatest(addDepartmentRequest.type, handleAddDepartment);
  yield sagaEffects.takeLatest(assignHODRequest.type, handleAssignHOD);
  yield sagaEffects.takeLatest(assignAdvisorRequest.type, handleAssignAdvisor);
  yield sagaEffects.takeLatest(submitAttendanceRequest.type, handleSubmitAttendance);
  yield sagaEffects.takeLatest(saveMarksRequest.type, handleSaveMarks);
  yield sagaEffects.takeLatest(addMaterialRequest.type, handleAddMaterial);
  yield sagaEffects.takeLatest(addAssignmentRequest.type, handleAddAssignment);
  yield sagaEffects.takeLatest(bulkAssignTopicsRequest.type, handleBulkAssignTopics);
  yield sagaEffects.takeLatest(submitAssignmentRequest.type, handleSubmitAssignment);
  yield sagaEffects.takeLatest(gradeSubmissionRequest.type, handleGradeSubmission);
  yield sagaEffects.takeLatest(addExamSchedulesRequest.type, handleAddExamSchedules);
  yield sagaEffects.takeLatest(approveTutorApplicationRequest.type, handleApproveTutorApplication);
  yield sagaEffects.takeLatest(bookTutoringSessionRequest.type, handleBookTutoringSession);
  yield sagaEffects.takeLatest(autoAssignMenteesRequest.type, handleAutoAssignMentees);
  yield sagaEffects.takeLatest(updateMentorAssignmentRequest.type, handleUpdateMentorAssignment);
  yield sagaEffects.takeLatest(addRemarkRequest.type, handleAddRemark);
  yield sagaEffects.takeLatest(applyForODRequest.type, handleApplyForOD);
  yield sagaEffects.takeLatest(processODRequest.type, handleProcessOD);
  yield sagaEffects.takeLatest(updateODApplicationRequest.type, handleUpdateODApplication);
  yield sagaEffects.takeLatest(fetchOnDutyApplicationsRequest.type, handleFetchOnDutyApplications);
  yield sagaEffects.takeLatest(fetchNoDuesCertificatesRequest.type, handleFetchNoDuesCertificates);
  yield sagaEffects.takeLatest(issueNoDuesCertificateRequest.type, handleIssueNoDuesCertificate);
  
  // Document Actions
  yield sagaEffects.takeLatest(uploadDocumentRequest.type, handleUploadDocument);
  yield sagaEffects.takeLatest(verifyDocumentRequest.type, handleVerifyDocument);
  
  // Fetch Actions
  yield sagaEffects.takeLatest(fetchUsersRequest.type, handleFetchUsers);
  yield sagaEffects.takeLatest(fetchDepartmentsRequest.type, handleFetchDepartments);
  yield sagaEffects.takeLatest(fetchCoursesRequest.type, handleFetchCourses);
  yield sagaEffects.takeLatest(fetchMarksRequest.type, handleFetchMarks);
  yield sagaEffects.takeLatest(fetchAttendanceRequest.type, handleFetchAttendance);
  yield sagaEffects.takeLatest(fetchMaterialsRequest.type, handleFetchMaterials);
  yield sagaEffects.takeLatest(fetchExamSchedulesRequest.type, handleFetchExamSchedules);
  yield sagaEffects.takeLatest(fetchMentorAssignmentsRequest.type, handleFetchMentorAssignments);
  yield sagaEffects.takeLatest(fetchRemarksRequest.type, handleFetchRemarks);
  yield sagaEffects.takeLatest(fetchTutorsRequest.type, handleFetchTutors);
  yield sagaEffects.takeLatest(fetchTutorApplicationsRequest.type, handleFetchTutorApplications);
  yield sagaEffects.takeLatest(fetchTutoringSessionsRequest.type, handleFetchTutoringSessions);
  yield sagaEffects.takeLatest(fetchAssignmentsRequest.type, handleFetchAssignments);
  yield sagaEffects.takeLatest(fetchStudentDocumentsRequest.type, handleFetchStudentDocuments);
  yield sagaEffects.takeLatest(fetchPendingDocumentsRequest.type, handleFetchPendingDocuments);
  yield sagaEffects.takeLatest(fetchSubmissionsRequest.type, handleFetchSubmissions);
  yield sagaEffects.takeLatest(fetchAnalyticsRequest.type, handleFetchAnalytics);
}

export default appSaga;
