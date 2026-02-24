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
} from '../slices/appSlice';
import { selectUser } from '../slices/authSlice';
import { showToast } from '../slices/uiSlice';

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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/users', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/departments', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/courses', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/marks', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/attendance', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/materials', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/exam-schedules', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/mentoring/assignments', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/mentoring/remarks', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/tutoring/tutors', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/admin/on-duty', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/admin/no-dues', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/tutoring/applications', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/tutoring/sessions', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/assignments', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/assignments/submissions', {
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

// --- USER MANAGEMENT SAGAS ---

function* handleAddUser(action: PayloadAction<Omit<User, 'id' | 'permissions'>>) {
    try {
        const newUser: User = {
            ...action.payload,
            id: generateId('u'),
            permissions: [], // Default permissions
        };
        D.USERS.splice(D.USERS.length, 0, newUser);
        yield sagaEffects.put(setUsers([...D.USERS]));
        yield sagaEffects.put(showToast({ type: 'success', message: 'User added successfully.' }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to add user.' }));
    }
}

function* handleBulkAddUsers(action: PayloadAction<Omit<Student, 'id'|'permissions'|'cgpa'|'sgpa'|'totalWorkingDays'|'daysPresent'|'address'|'photoUrl'|'dues'>[]>) {
    try {
        const existingRegNos = new Set(D.USERS.map(u => (u as Student).regNo).filter(Boolean));
        const newUsers: Student[] = [];

        for (const userData of action.payload) {
            if (!existingRegNos.has(userData.regNo)) {
                const newStudent: Student = {
                    ...userData,
                    id: generateId('u'),
                    permissions: [],
                    cgpa: 0,
                    sgpa: [],
                    status: StudentStatus.ACTIVE,
                    dues: { library: false, department: false, accounts: false },
                };
                newUsers.push(newStudent);
                existingRegNos.add(newStudent.regNo);
            }
        }

        D.USERS.push(...newUsers);
        yield sagaEffects.put(setUsers([...D.USERS]));
        yield sagaEffects.put(showToast({ type: 'success', message: `${newUsers.length} new students added successfully.` }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to perform bulk user upload.' }));
    }
}

function* handleTransferStudents(action: PayloadAction<{ studentIds: string[], newDepartmentId: string }>) {
    try {
        const { studentIds, newDepartmentId } = action.payload;
        
        const newUsers = D.USERS.map(user => {
            if (studentIds.includes(user.id) && user.role === UserRole.STUDENT && user.status === StudentStatus.ACTIVE) {
                return {
                    ...(user as Student),
                    departmentId: newDepartmentId,
                    year: 2,
                };
            }
            return user;
        });

        D.USERS.splice(0, D.USERS.length, ...newUsers);
        yield sagaEffects.put(setUsers(newUsers));
        yield sagaEffects.put(showToast({ type: 'success', message: `${studentIds.length} students transferred successfully.` }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to transfer students.' }));
    }
}

function* handlePromoteClass(action: PayloadAction<{ departmentId: string; year: number }>) {
    try {
        const { departmentId, year } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/users/promote', {
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
        const userIndex = D.USERS.findIndex(u => u.id === action.payload.id);
        if (userIndex > -1) {
            D.USERS[userIndex] = action.payload;
            yield sagaEffects.put(setUsers([...D.USERS]));
            yield sagaEffects.put(showToast({ type: 'success', message: 'User updated successfully.' }));
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to update user.' }));
    }
}

function* handleBulkUpdateUsersStatus(action: PayloadAction<{ userIds: string[], status: 'Active' | 'Inactive' }>) {
    try {
        const { userIds, status } = action.payload;
        const newUsers = D.USERS.map(user => {
            if (userIds.includes(user.id)) {
                return { ...user, status: status as StudentStatus };
            }
            return user;
        });
        D.USERS.splice(0, D.USERS.length, ...newUsers);
        yield sagaEffects.put(setUsers(newUsers));
        yield sagaEffects.put(showToast({ type: 'success', message: `${userIds.length} users updated to ${status}.` }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to update user statuses.' }));
    }
}

function* handleBulkPromoteStudents(action: PayloadAction<{ userIds: string[] }>) {
    try {
        const { userIds } = action.payload;
        const newUsers = D.USERS.map(user => {
            if (userIds.includes(user.id) && user.role === UserRole.STUDENT && (user as Student | Alumnus).status !== StudentStatus.ALUMNI) {
                const student = user as Student;
                if (student.year < 4) {
                    return { ...student, year: student.year + 1 };
                } else {
                    const alumnus: Alumnus = {
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        role: student.role,
                        departmentId: student.departmentId,
                        status: StudentStatus.ALUMNI,
                        phone: student.phone,
                        address: student.address,
                        photoUrl: student.photoUrl,
                        permissions: student.permissions,
                        regNo: student.regNo,
                        section: student.section,
                        admissionYear: student.admissionYear,
                        year: student.year,
                        cgpa: student.cgpa,
                        sgpa: student.sgpa,
                        graduationYear: new Date().getFullYear(),
                        finalCgpa: student.cgpa,
                        dues: { library: true, department: true, accounts: true },
                    };
                    return alumnus;
                }
            }
            return user;
        });

        D.USERS.splice(0, D.USERS.length, ...newUsers);
        yield sagaEffects.put(setUsers(newUsers));
        yield sagaEffects.put(showToast({ type: 'success', message: `${userIds.length} students promoted.` }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to promote students.' }));
    }
}


function* handleRemoveUser(action: PayloadAction<string>) {
    try {
        const userIndex = D.USERS.findIndex(u => u.id === action.payload);
        if (userIndex > -1) {
            D.USERS.splice(userIndex, 1);
        }
        yield sagaEffects.put(setUsers([...D.USERS]));
        yield sagaEffects.put(showToast({ type: 'success', message: 'User removed successfully.' }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to remove user.' }));
    }
}

function* handleUpdateUserPermissions(action: PayloadAction<{ userId: string; permissions: Permission[] }>) {
  try {
    const { userId, permissions } = action.payload;
    const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

    const response: Response = yield sagaEffects.call(fetch, `http://localhost:5000/api/users/${userId}/permissions`, {
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
        const newDept: Department = { id: generateId('d'), name: action.payload };
        D.DEPARTMENTS.splice(D.DEPARTMENTS.length, 0, newDept);
        yield sagaEffects.put(setDepartments([...D.DEPARTMENTS]));
        yield sagaEffects.put(showToast({ type: 'success', message: 'Department created successfully.' }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to create department.' }));
    }
}

function* handleAssignHOD(action: PayloadAction<{ deptId: string; staffId: string } | { deptId: string; newUser: { name: string; email: string; contact?: string } }>) {
    try {
        const { deptId } = action.payload;
        
        // Demote the old HOD first
        const oldHOD = D.USERS.find(u => u.departmentId === deptId && u.role === UserRole.HOD);
        if (oldHOD) {
            oldHOD.role = UserRole.STAFF;
        }

        if ('staffId' in action.payload) { // Assign existing staff
            const { staffId } = action.payload;
            const newHOD = D.USERS.find(u => u.id === staffId);
            if (newHOD) {
                newHOD.role = UserRole.HOD;
            }
        } else { // Create and assign new staff as HOD
            const { newUser } = action.payload;
            const newHOD: Staff = {
                id: generateId('u'),
                name: newUser.name,
                email: newUser.email,
                phone: newUser.contact,
                role: UserRole.HOD,
                departmentId: deptId,
                status: StudentStatus.ACTIVE,
                permissions: [Permission.VIEW_USERS],
            };
            D.USERS.splice(D.USERS.length, 0, newHOD);
        }
        
        yield sagaEffects.put(setUsers([...D.USERS]));
        yield sagaEffects.put(showToast({ type: 'success', message: 'HOD assigned successfully.' }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to assign HOD.' }));
    }
}

function* handleAssignAdvisor(action: PayloadAction<{ departmentId: string; year: number; advisorId: string }>) {
    try {
        const { departmentId, year, advisorId } = action.payload;
        const classIndex = D.CLASSES.findIndex(c => c.departmentId === departmentId && c.year === year);

        if (classIndex > -1) {
            D.CLASSES[classIndex].advisorId = advisorId;
        } else {
            const newAssignment: ClassInDepartment = { departmentId, year, advisorId };
            D.CLASSES.splice(D.CLASSES.length, 0, newAssignment);
        }

        yield sagaEffects.put(setClasses([...D.CLASSES]));
        yield sagaEffects.put(showToast({ type: 'success', message: 'Class advisor assigned successfully.' }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to assign class advisor.' }));
    }
}

// --- STAFF SAGAS ---

function* handleSubmitAttendance(action: PayloadAction<{ courseId: string; records: Record<string, boolean>}>) {
    try {
        const { courseId, records } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/attendance', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/marks', {
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/academic/materials', {
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

        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/assignments', {
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
        const { assignments } = action.payload;

        assignments.forEach(({ studentId, topic, remarks }) => {
            // This is a simplified logic. A real app might need to find a specific assignment ID.
            // For now, let's assume this updates a 'topic' on the submission record.
            const submission = D.SUBMISSIONS.find(s => s.studentId === studentId); // Simplified find
            if (submission) {
                submission.topic = topic;
                submission.remarks = remarks;
            } else {
                // This scenario needs more context, e.g., which assignment are we assigning to?
                // For the demo, we'll assume a single assignment per course for simplicity.
                const assignment = D.ASSIGNMENTS.find(a => a.courseId === action.payload.courseId);
                if (assignment) {
                     const newSubmission: StudentSubmission = {
                        assignmentId: assignment.id,
                        studentId: studentId,
                        submittedAt: new Date().toISOString(),
                        status: 'Not Submitted',
                        topic: topic,
                        remarks: remarks,
                    };
                    D.SUBMISSIONS.push(newSubmission);
                }
            }
        });
        
        yield sagaEffects.put(setSubmissions([...D.SUBMISSIONS]));
        yield sagaEffects.put(showToast({ type: 'success', message: 'Topics assigned successfully.' }));
    } catch (error) {
        yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to assign topics.' }));
    }
}

function* handleSubmitAssignment(action: PayloadAction<Omit<StudentSubmission, 'submittedAt' | 'status' | 'grade'>>) {
    try {
        const { assignmentId, ...submissionData } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');

        const response: Response = yield sagaEffects.call(fetch, `http://localhost:5000/api/assignments/${assignmentId}/submit`, {
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

        const response: Response = yield sagaEffects.call(fetch, `http://localhost:5000/api/assignments/grade`, {
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
             sagaEffects.call(fetch, 'http://localhost:5000/api/academic/exam-schedules', {
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
        const response: Response = yield sagaEffects.call(fetch, `http://localhost:5000/api/tutoring/applications/${applicationId}/approve`, {
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/tutoring/sessions', {
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/mentoring/assignments/auto-assign', {
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/mentoring/assignments', {
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/mentoring/remarks', {
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/admin/on-duty/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Application submitted successfully.' }));
        } else {
             const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
             throw new Error(errorData.message || 'Failed to submit application.');
        }
    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(showToast({ type: 'error', message: error.message }));
        } else {
            yield sagaEffects.put(showToast({ type: 'error', message: 'Failed to submit application.' }));
        }
    }
}

function* handleProcessOD(action: PayloadAction<{ applicationId: string; decision: 'approve' | 'reject'; }>) {
    try {
        const { applicationId, decision } = action.payload;
        const token: string | null = yield sagaEffects.call([localStorage, 'getItem'], 'lms_token');
        const response: Response = yield sagaEffects.call(fetch, `http://localhost:5000/api/admin/on-duty/${applicationId}/process`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ decision }),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Application processed.' }));
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
        const response: Response = yield sagaEffects.call(fetch, `http://localhost:5000/api/admin/on-duty/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates),
        });

        if (response.ok) {
            yield sagaEffects.put(showToast({ type: 'success', message: 'Application updated successfully.' }));
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/admin/no-dues/update-dues', {
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
        const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/admin/no-dues/issue', {
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
  yield sagaEffects.takeLatest(fetchSubmissionsRequest.type, handleFetchSubmissions);
}

export default appSaga;
