import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { GRADE_POINTS } from '../../../constants';
import EmptyState from '../../shared/EmptyState';
import { Input } from '../../ui/Input';
import { AppDispatch } from '../../../store';
import { saveMarksRequest, selectAllCourses, selectAllUsers } from '../../../store/slices/appSlice';
import { Grade, UserRole, StudentStatus, Student } from '../../../types';
import { Link } from 'react-router-dom';

interface Marks {
    internal?: number;
    exam?: number;
}

const MarksManagement: React.FC = () => {
    const user = useSelector(selectUser);
    const COURSES = useSelector(selectAllCourses);
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [marks, setMarks] = useState<Record<string, Marks>>({});

    const myCourses = useMemo(() => COURSES.filter(c => c.staffId === user?.id), [user]);
    const studentsInCourse = useMemo(() => {
        if (!selectedCourse) return [];
        const course = myCourses.find(c => c.id === selectedCourse);
        return STUDENTS.filter(s => s.departmentId === course?.departmentId);
    }, [selectedCourse, myCourses]);

    useEffect(() => {
        setMarks({});
    }, [selectedCourse]);

    const handleMarkChange = (studentId: string, type: 'internal' | 'exam', value: string) => {
        const numValue = value === '' ? undefined : parseInt(value, 10);
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [type]: numValue
            }
        }));
    };

    const handleSaveMarks = () => {
        dispatch(saveMarksRequest({ courseId: selectedCourse, marks }));
        // Optionally show a toast notification
    };

    const calculateGrade = (internal?: number, exam?: number): Grade | 'N/A' | 'Invalid' => {
        if (internal === undefined || exam === undefined) return 'N/A';
        if (internal < 0 || internal > 50 || exam < 0 || exam > 100) return 'Invalid';
        
        const total = internal + (exam / 2); // Total out of 100
        if (total >= 91) return 'O';
        if (total >= 81) return 'A+';
        if (total >= 71) return 'A';
        if (total >= 61) return 'B+';
        if (total >= 51) return 'B';
        if (total >= 50) return 'C';
        return 'RA';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold">Marks Management</h1>
                    <p className="text-gray-500">Upload marks and auto-calculate GPA for your students.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enter Student Marks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {studentsInCourse.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Internal (50)</TableHead>
                                                <TableHead>Exam (100)</TableHead>
                                                <TableHead>Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {studentsInCourse.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">
                                                        <Link to={`/profile/${student.id}`} className="hover:opacity-80 transition-opacity">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                {student.name}
                                                            </span>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number"
                                                            min="0" max="50"
                                                            className="w-24 h-9"
                                                            value={marks[student.id]?.internal ?? ''}
                                                            onChange={e => handleMarkChange(student.id, 'internal', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number"
                                                            min="0" max="100"
                                                            className="w-24 h-9"
                                                            value={marks[student.id]?.exam ?? ''}
                                                            onChange={e => handleMarkChange(student.id, 'exam', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                                            {calculateGrade(marks[student.id]?.internal, marks[student.id]?.exam)}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <EmptyState title="No Course Selected" message="Please select a course to enter marks." />
                            )}
                        </CardContent>
                    </Card>
                    {selectedCourse && (
                        <div className="flex justify-end">
                            <Button onClick={handleSaveMarks}>Save Marks</Button>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grading Scale</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {Object.entries(GRADE_POINTS).map(([grade, point]) => (
                                    <li key={grade} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
                                        <span className="font-medium text-gray-700">Grade '{grade}'</span>
                                        <span className="text-gray-500 font-semibold">{point} Points</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MarksManagement;