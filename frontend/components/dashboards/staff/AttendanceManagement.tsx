import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { ATTENDANCE } from '../../../constants';
import EmptyState from '../../shared/EmptyState';
import { Switch } from '../../ui/Switch';
import { AppDispatch } from '../../../store';
import { submitAttendanceRequest, selectAllCourses, selectAllUsers } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student } from '../../../types';
import { Link } from 'react-router-dom';

const AttendanceManagement: React.FC = () => {
    const user = useSelector(selectUser);
    const COURSES = useSelector(selectAllCourses);
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const myCourses = useMemo(() => COURSES.filter(c => c.staffId === user?.id), [user]);
    const studentsInCourse = useMemo(() => {
        if (!selectedCourse) return [];
        const course = myCourses.find(c => c.id === selectedCourse);
        return STUDENTS.filter(s => s.departmentId === course?.departmentId);
    }, [selectedCourse, myCourses]);

    useEffect(() => {
        // Reset state when course changes
        const initialAttendance = studentsInCourse.reduce((acc, student) => {
            acc[student.id] = true; // Default to present
            return acc;
        }, {} as Record<string, boolean>);
        setAttendance(initialAttendance);
        setIsSubmitted(false);
    }, [selectedCourse, studentsInCourse]);

    const getStudentCourseAttendancePercentage = (studentId: string, courseId: string) => {
        const studentAttendanceForCourse = ATTENDANCE.filter(
            a => a.studentId === studentId && a.courseId === courseId
        );
        if (studentAttendanceForCourse.length === 0) {
            return { percentage: 100, present: 0, total: 0 }; // Assume 100% if no records yet
        }
        const presentCount = studentAttendanceForCourse.filter(a => a.present).length;
        const percentage = Math.round((presentCount / studentAttendanceForCourse.length) * 100);
        return { percentage, present: presentCount, total: studentAttendanceForCourse.length };
    };

    const handleToggle = (studentId: string) => {
        if (isSubmitted) return;
        setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const handleSubmit = () => {
        dispatch(submitAttendanceRequest({ courseId: selectedCourse, records: attendance }));
        setIsSubmitted(true);
    };
    
    const areAllPresent = useMemo(() => {
        if (studentsInCourse.length === 0) return false;
        return studentsInCourse.every(student => attendance[student.id]);
    }, [attendance, studentsInCourse]);

    const handleToggleAll = () => {
        if (isSubmitted) return;
        const newStatus = !areAllPresent;
        const newAttendance = studentsInCourse.reduce((acc, student) => {
            acc[student.id] = newStatus;
            return acc;
        }, {} as Record<string, boolean>);
        setAttendance(newAttendance);
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold">Attendance Management</h1>
                    <p className="text-gray-500">Mark daily attendance for your courses.</p>
                </div>
                <div className="w-full sm:w-64">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger><SelectValue placeholder="Select a course..." /></SelectTrigger>
                        <SelectContent>
                            {myCourses.map(course => <SelectItem key={course.id} value={course.id}>{course.name} ({course.code})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Student List</CardTitle>
                            <CardDescription>Use the toggles to mark students as present or absent.</CardDescription>
                        </div>
                         {selectedCourse && studentsInCourse.length > 0 && (
                            <Button variant="secondary" size="sm" onClick={handleToggleAll} disabled={isSubmitted}>
                                {areAllPresent ? 'Mark All Absent' : 'Mark All Present'}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {studentsInCourse.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Overall Attendance</TableHead>
                                        <TableHead className="text-center">Today's Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsInCourse.map(student => {
                                        const overallAtt = getStudentCourseAttendancePercentage(student.id, selectedCourse);
                                        return (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                <Link to={`/profile/${student.id}`} className="hover:opacity-80 transition-opacity">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {student.name}
                                                    </span>
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${overallAtt.percentage < 75 ? 'text-red-500' : 'text-slate-700'}`}>
                                                        {overallAtt.percentage}%
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        ({overallAtt.present}/{overallAtt.total})
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="flex justify-center items-center gap-3">
                                                <span className={`text-sm font-medium transition-colors ${!attendance[student.id] ? 'text-gray-800' : 'text-gray-400'}`}>Absent</span>
                                                <Switch
                                                    checked={attendance[student.id] ?? false}
                                                    onCheckedChange={() => handleToggle(student.id)}
                                                    disabled={isSubmitted}
                                                />
                                                <span className={`text-sm font-medium transition-colors ${attendance[student.id] ? 'text-blue-600' : 'text-gray-400'}`}>Present</span>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState title="No Course Selected" message="Please select a course to view the student list." />
                    )}
                </CardContent>
            </Card>

            {selectedCourse && (
                <div className="flex justify-end items-center gap-4">
                    <Button onClick={handleSubmit} disabled={isSubmitted}>
                        {isSubmitted ? 'Attendance Submitted' : 'Submit Attendance'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
