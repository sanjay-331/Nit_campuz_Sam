import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectAllCourses, selectAllMarks, selectAllSubmissions, selectAllAssignments, selectAllClasses, selectAllAttendance, selectAllMentorAssignments } from '../store/slices/appSlice';
import { selectUser } from '../store/slices/authSlice';
import { Student, Staff, UserRole } from '../types';
import EmptyState from '../components/shared/EmptyState';
import Button from '../components/ui/Button';
import { ChevronLeftIcon, MailIcon, BriefcaseIcon, OfficeBuildingIcon, ClockIcon, DocumentReportIcon, BarChartIcon, PencilIcon, UserIcon, HeartIcon } from '../components/icons/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { DEPARTMENTS } from '../constants';
import Breadcrumb from '../components/ui/Breadcrumb';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const StudentProfile: React.FC<{ student: Student }> = ({ student }) => {
    const allMarks = useSelector(selectAllMarks);
    const allCourses = useSelector(selectAllCourses);
    const allAssignments = useSelector(selectAllAssignments);
    const allSubmissions = useSelector(selectAllSubmissions);
    const allAttendance = useSelector(selectAllAttendance);
    const allClasses = useSelector(selectAllClasses);
    const allUsers = useSelector(selectAllUsers);
    const allMentorAssignments = useSelector(selectAllMentorAssignments);

    const myMarks = useMemo(() => allMarks.filter(m => m.studentId === student.id), [allMarks, student.id]);
    const mySubmissions = useMemo(() => allSubmissions.filter(s => s.studentId === student.id), [allSubmissions, student.id]);
    const myAttendance = useMemo(() => allAttendance.filter(a => a.studentId === student.id), [allAttendance, student.id]);

    const myClassAdvisor = useMemo(() => {
        const myClass = allClasses.find(c => c.departmentId === student.departmentId && c.year === student.year);
        return myClass ? allUsers.find(u => u.id === myClass.advisorId) : null;
    }, [allClasses, allUsers, student]);
    
    const myMentor = useMemo(() => {
        const assignment = allMentorAssignments.find(m => m.studentId === student.id);
        return assignment ? allUsers.find(u => u.id === assignment.mentorId) : null;
    }, [allMentorAssignments, allUsers, student]);

    const attendancePercentage = useMemo(() => {
        if (myAttendance.length === 0) return 100;
        const presentCount = myAttendance.filter(a => a.present).length;
        return Math.round((presentCount / myAttendance.length) * 100);
    }, [myAttendance]);
    
    const latestSgpa = useMemo(() => {
        if (!student.sgpa || student.sgpa.length === 0) return null;
        // The sgpa array is not guaranteed to be sorted, so find the max semester
        const latest = student.sgpa.reduce((prev, current) => (prev.semester > current.semester) ? prev : current);
        return latest;
    }, [student.sgpa]);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                        <p className="text-slate-500">Roll No: {student.email.split('@')[0].toUpperCase()}</p>
                        <p className="text-xs text-slate-400">Reg No: {student.regNo || 'N/A'}</p>
                        <p className="text-xs text-slate-400">Section: {student.section || 'A'}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Academic Snapshot</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center border-b pb-4 mb-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500">CGPA</p>
                                <p className="text-2xl font-bold text-indigo-600">{student.cgpa.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500">Latest SGPA (Sem {latestSgpa?.semester})</p>
                                <p className="text-2xl font-bold text-indigo-600">{latestSgpa?.gpa.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500">Attendance</p>
                                <p className="text-2xl font-bold text-indigo-600">{attendancePercentage}%</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <p className="flex justify-between"><span>Year:</span> <span className="font-medium">{student.year}</span></p>
                            <p className="flex justify-between"><span>Department:</span> <span className="font-medium">{DEPARTMENTS.find(d => d.id === student.departmentId)?.name || 'N/A'}</span></p>
                            <p className="flex justify-between items-center"><MailIcon className="w-4 h-4 text-slate-400"/> <span className="font-medium">{student.email}</span></p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Support Faculty</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         {myClassAdvisor ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Class Advisor</p>
                                    <p className="font-semibold">{myClassAdvisor.name}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Class advisor not assigned.</p>
                        )}
                        {myMentor ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm flex-shrink-0">
                                    <HeartIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mentor</p>
                                    <p className="font-semibold">{myMentor.name}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Mentor not assigned.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader><CardTitle>Exam Results</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Semester</TableHead><TableHead>Course</TableHead><TableHead>Grade</TableHead><TableHead>Grade Point</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {myMarks.sort((a,b) => a.semester - b.semester).map(mark => {
                                const course = allCourses.find(c => c.id === mark.courseId);
                                return <TableRow key={mark.courseId}><TableCell>{mark.semester}</TableCell><TableCell>{course?.name}</TableCell><TableCell>{mark.grade}</TableCell><TableCell>{mark.gradePoint.toFixed(1)}</TableCell></TableRow>;
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Assignment Submissions</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Assignment</TableHead><TableHead>Status</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {mySubmissions.map(sub => {
                                const assignment = allAssignments.find(a => a.id === sub.assignmentId);
                                return <TableRow key={sub.assignmentId}><TableCell>{assignment?.title}</TableCell><TableCell>{sub.status}</TableCell><TableCell>{sub.grade || 'N/A'}</TableCell></TableRow>;
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

const StaffProfile: React.FC<{ staff: Staff }> = ({ staff }) => {
    const allCourses = useSelector(selectAllCourses);
    const allClasses = useSelector(selectAllClasses);

    const myCourses = useMemo(() => allCourses.filter(c => c.staffId === staff.id), [allCourses, staff.id]);
    const myAdvisoryClass = useMemo(() => allClasses.find(c => c.advisorId === staff.id), [allClasses, staff.id]);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                        <h2 className="text-2xl font-bold text-slate-800">{staff.name}</h2>
                        <p className="text-indigo-600 font-bold tracking-tight uppercase">{staff.designation || staff.role}</p>
                        <p className="text-xs text-slate-400 mt-1">Joined {staff.dateJoined ? new Date(staff.dateJoined).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-xs text-slate-400">Employee ID: {staff.id}</p>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Professional Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center text-sm"><OfficeBuildingIcon className="w-5 h-5 mr-3 text-slate-400" /><span className="font-medium">Department:</span><span className="ml-auto">{DEPARTMENTS.find(d => d.id === staff.departmentId)?.name || 'N/A'}</span></div>
                        <div className="flex items-center text-sm"><MailIcon className="w-5 h-5 mr-3 text-slate-400" /><span className="font-medium">Email:</span><span className="ml-auto">{staff.email}</span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Responsibilities</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-start text-sm"><PencilIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" /><span className="font-medium">Subjects:</span><span className="ml-auto text-right">{myCourses.map(c => c.name).join(', ')}</span></div>
                        {myAdvisoryClass && <div className="flex items-center text-sm"><UserIcon className="w-5 h-5 mr-3 text-slate-400" /><span className="font-medium">Class Advisor:</span><span className="ml-auto">{myAdvisoryClass.year}nd Year</span></div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Attendance Record (Mock)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center text-sm"><ClockIcon className="w-5 h-5 mr-3 text-slate-400" /><span className="font-medium">YTD Presence:</span><span className="ml-auto font-semibold">98%</span></div>
                        <div className="flex items-center text-sm"><ClockIcon className="w-5 h-5 mr-3 text-slate-400" /><span className="font-medium">Leaves Taken:</span><span className="ml-auto font-semibold">3 Days</span></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Performance (Mock)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center text-sm"><BarChartIcon className="w-5 h-5 mr-3 text-slate-400" /><span className="font-medium">Student Feedback:</span><span className="ml-auto font-semibold">4.8 / 5.0</span></div>
                        <div className="flex items-center text-sm"><DocumentReportIcon className="w-5 h-5 mr-3 text-slate-400" /><span className="font-medium">Publications:</span><span className="ml-auto font-semibold">5</span></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const allUsers = useSelector(selectAllUsers);
    const loggedInUser = useSelector(selectUser);

    const user = allUsers.find(u => u.id === userId);

    const breadcrumbItems = useMemo(() => {
        if (!user || !loggedInUser) return [];

        const baseLinks = {
            [UserRole.ADMIN]: { label: 'Users', href: '/users' },
            [UserRole.PRINCIPAL]: { label: 'Directory', href: '/directory' },
            [UserRole.HOD]: { 
                label: user.role === UserRole.STUDENT ? 'Students' : 'Staff', 
                href: user.role === UserRole.STUDENT ? '/students' : '/staff' 
            },
            [UserRole.STAFF]: { label: 'My Mentees', href: '/my-mentees' },
        };

        const baseLink = baseLinks[loggedInUser.role as keyof typeof baseLinks];

        if (baseLink) {
            return [baseLink, { label: user.name }];
        }

        // Fallback breadcrumb
        return [{ label: 'Profiles' }, { label: user.name }];
    }, [loggedInUser, user]);

    if (!user) {
        return <EmptyState title="User Not Found" message="The user profile you are looking for does not exist." />;
    }

    const isStudent = user.role === UserRole.STUDENT;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Breadcrumb items={breadcrumbItems} />
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ChevronLeftIcon className="w-4 h-4" />}>
                    Back
                </Button>
            </div>
            {isStudent ? <StudentProfile student={user as Student} /> : <StaffProfile staff={user as Staff} />}
        </div>
    );
};

export default UserProfilePage;
