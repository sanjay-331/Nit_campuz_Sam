import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import EmptyState from '../../shared/EmptyState';
import { Switch } from '../../ui/Switch';
import { AppDispatch } from '../../../store';
import { submitAttendanceRequest, selectAllCourses, selectAllUsers, selectAllAttendance } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student } from '../../../types';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { ClockIcon } from '../../icons/Icons';

const AttendanceManagement: React.FC = () => {
    const user = useSelector(selectUser);
    const COURSES = useSelector(selectAllCourses);
    const ALL_ATTENDANCE = useSelector(selectAllAttendance);
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const dispatch = useDispatch<AppDispatch>();
    
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const myCourses = useMemo(() => COURSES.filter(c => c.staffId === user?.id), [user, COURSES]);
    
    const studentsInCourse = useMemo(() => {
        if (!selectedCourse) return [];
        const course = myCourses.find(c => c.id === selectedCourse);
        if (!course) return [];
        const targetYear = Math.floor((course.semester + 1) / 2);
        return STUDENTS.filter(s => s.departmentId === course.departmentId && s.year === targetYear);
    }, [selectedCourse, myCourses, STUDENTS]);

    useEffect(() => {
        // Reset state when course changes
        const initialAttendance = studentsInCourse.reduce((acc, student) => {
            acc[student.id] = true; // Default to present
            return acc;
        }, {} as Record<string, boolean>);
        setAttendance(initialAttendance);
        setIsSubmitted(false);
    }, [selectedCourse, studentsInCourse]);

    const attendanceHistory = useMemo(() => {
        if (!selectedCourse) return [];
        const records = ALL_ATTENDANCE.filter(a => a.courseId === selectedCourse);
        const groups: { [key: string]: any[] } = {};
        records.forEach(r => {
            const dateStr = new Date(r.date).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(r);
        });
        return Object.entries(groups).map(([date, items]) => ({
            date,
            present: items.filter(i => i.present).length,
            total: items.length
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedCourse, ALL_ATTENDANCE]);

    const getStudentCourseAttendancePercentage = (studentId: string, courseId: string) => {
        const studentAttendanceForCourse = ALL_ATTENDANCE.filter(
            a => a.studentId === studentId && a.courseId === courseId
        );
        if (studentAttendanceForCourse.length === 0) {
            return { percentage: 100, present: 0, total: 0 };
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
        if (!selectedCourse) return;
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
        <div className="space-y-6 text-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
                    <p className="text-gray-500">Track and manage student presence.</p>
                </div>
                <div className="w-full sm:w-64">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="bg-white border-slate-200 shadow-sm"><SelectValue placeholder="Select a course..." /></SelectTrigger>
                        <SelectContent>
                            {myCourses.map(course => <SelectItem key={course.id} value={course.id}>{course.name} ({course.code})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="mark">
                <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
                    <TabsTrigger value="mark" className="rounded-lg">Mark Attendance</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg">Attendance History</TabsTrigger>
                </TabsList>

                <TabsContent value="mark" className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl">Daily Register</CardTitle>
                                    <CardDescription>Update presence for today's session.</CardDescription>
                                </div>
                                 {selectedCourse && studentsInCourse.length > 0 && (
                                    <Button variant="secondary" size="sm" onClick={handleToggleAll} disabled={isSubmitted} className="rounded-xl">
                                        {areAllPresent ? 'Mark All Absent' : 'Mark All Present'}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {studentsInCourse.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="font-bold">Student Name</TableHead>
                                                <TableHead className="font-bold">Aggregated %</TableHead>
                                                <TableHead className="text-center font-bold">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y">
                                            {studentsInCourse.map(student => {
                                                const overallAtt = getStudentCourseAttendancePercentage(student.id, selectedCourse);
                                                return (
                                                <TableRow key={student.id} className="hover:bg-indigo-50/20 transition-colors">
                                                    <TableCell className="font-bold py-4">
                                                        <Link to={`/profile/${student.id}`} className="hover:text-indigo-600 transition-colors">
                                                            {student.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${overallAtt.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                            <span className="font-bold">{overallAtt.percentage}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="flex justify-center items-center gap-4 py-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${!attendance[student.id] ? 'text-rose-600' : 'text-slate-300'}`}>Absent</span>
                                                        <Switch
                                                            className="data-[state=checked]:bg-indigo-600"
                                                            checked={attendance[student.id] ?? false}
                                                            onCheckedChange={() => handleToggle(student.id)}
                                                            disabled={isSubmitted}
                                                        />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${attendance[student.id] ? 'text-emerald-600' : 'text-slate-300'}`}>Present</span>
                                                    </TableCell>
                                                </TableRow>
                                            )})}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                                        <ClockIcon className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">No Course Ready</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto">Please select a course from the dropdown above to manage attendance.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {selectedCourse && (
                        <div className="flex justify-end gap-4">
                            <Button onClick={handleSubmit} disabled={isSubmitted || studentsInCourse.length === 0} className="rounded-xl h-11 px-8 bg-slate-900 shadow-lg shadow-slate-200 transition-all hover:scale-[1.02]">
                                {isSubmitted ? 'Successfully Logged' : 'Submit Attendance Register'}
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attendanceHistory.length > 0 ? (
                            attendanceHistory.map(day => (
                                <Card key={day.date} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold truncate">{day.date}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                             <div className="text-2xl font-black text-slate-800">
                                                {day.present}
                                                <span className="text-sm text-slate-400 font-medium ml-1">/ {day.total} Present</span>
                                            </div>
                                            <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-600" 
                                                    style={{ width: `${(day.present/day.total)*100}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                                        <ClockIcon className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">No History Available</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto">History records will appear once you start submitting daily logs.</p>
                                </div>
                        )}
                     </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AttendanceManagement;
