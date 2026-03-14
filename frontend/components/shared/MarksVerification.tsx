import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import Button from '../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllMarks, selectAllCourses, selectAllUsers, verifyMarksRequest, publishMarksRequest } from '../../store/slices/appSlice';
import { MarkStatus, UserRole } from '../../types';
import { selectUser } from '../../store/slices/authSlice';
import EmptyState from '../shared/EmptyState';
import { CheckCircleIcon } from '../icons/Icons';


const MarksVerification: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const MARKS = useSelector(selectAllMarks);
    const COURSES = useSelector(selectAllCourses);
    const users = useSelector(selectAllUsers);

    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

    // Determine target status based on role
    const getTargetStatus = () => {
        if (user?.role === UserRole.EXAM_CELL) return MarkStatus.PENDING_EXAM_CELL;
        if (user?.role === UserRole.HOD) return MarkStatus.PENDING_HOD;
        if (user?.role === UserRole.PRINCIPAL) return MarkStatus.PENDING_PRINCIPAL;
        return null;
    };

    const targetStatus = getTargetStatus();

    const pendingCourses = useMemo(() => {
        const status = targetStatus;
        if (!status) return [];
        
        const courseIds = [...new Set(MARKS.filter(m => m.status === status).map(m => m.courseId))];
        return COURSES.filter(c => courseIds.includes(c.id));
    }, [MARKS, COURSES, targetStatus]);

    const marksForCourse = useMemo(() => {
        if (!selectedCourse || !targetStatus) return [];
        return MARKS.filter(m => m.courseId === selectedCourse && m.status === targetStatus);
    }, [selectedCourse, MARKS, targetStatus]);

    const handleVerify = () => {
        if (marksForCourse.length > 0) {
            dispatch(verifyMarksRequest({ markIds: marksForCourse.map(m => m.id) }));
            setSelectedCourse(null);
        }
    };

    const handlePublish = (courseId: string) => {
        dispatch(publishMarksRequest({ courseId }));
    };

    // Courses ready for publication (only for Exam Cell)
    const readyToPublishCourses = useMemo(() => {
        if (user?.role !== UserRole.EXAM_CELL) return [];
        const courseIds = [...new Set(MARKS.filter(m => m.status === MarkStatus.PENDING_PUBLICATION).map(m => m.courseId))];
        return COURSES.filter(c => courseIds.includes(c.id));
    }, [MARKS, COURSES, user]);

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Marks Verification & Publishing</h1>
                <p className="text-slate-500">Currently acting as: <span className="font-bold text-indigo-600">{user.role}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Verification</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingCourses.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 italic">No courses pending your verification.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {pendingCourses.map(course => (
                                        <button
                                            key={course.id}
                                            onClick={() => setSelectedCourse(course.id)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedCourse === course.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                                        >
                                            <p className="font-bold text-slate-800">{course.name}</p>
                                            <p className="text-xs text-slate-400">{course.code}</p>
                                            <div className="mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full inline-block">
                                                {MARKS.filter(m => m.courseId === course.id && m.status === targetStatus).length} Students
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {user.role === UserRole.EXAM_CELL && (
                        <Card className="border-emerald-200 bg-emerald-50/20">
                            <CardHeader>
                                <CardTitle className="text-emerald-800">Ready to Publish</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {readyToPublishCourses.length === 0 ? (
                                    <div className="p-6 text-center text-emerald-400 italic">No results ready for final publishing.</div>
                                ) : (
                                    <div className="divide-y divide-emerald-100">
                                        {readyToPublishCourses.map(course => (
                                            <div key={course.id} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-emerald-800">{course.name}</p>
                                                    <p className="text-xs text-emerald-600/60">{course.code}</p>
                                                </div>
                                                <Button size="sm" onClick={() => handlePublish(course.id)} leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
                                                    Publish
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {selectedCourse ? (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Verify {COURSES.find(c => c.id === selectedCourse)?.name}</CardTitle>
                                    <p className="text-xs text-slate-400">Review marks before approval</p>
                                </div>
                                <Button onClick={handleVerify} leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
                                    Verify All
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Internal</TableHead>
                                                <TableHead>Exam</TableHead>
                                                <TableHead>Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {marksForCourse.map(mark => (
                                                <TableRow key={mark.studentId}>
                                                    <TableCell className="font-medium">
                                                        {users.find(u => u.id === mark.studentId)?.name || 'Unknown Student'}
                                                    </TableCell>
                                                    <TableCell>{mark.internal}</TableCell>
                                                    <TableCell>{mark.exam}</TableCell>
                                                    <TableCell><span className="font-black text-indigo-600">{mark.grade}</span></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full border-dashed flex items-center justify-center py-20">
                            <EmptyState
                                title="Selection Required"
                                message="Select a course from the pending list to review and verify marks."
                            />
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarksVerification;
