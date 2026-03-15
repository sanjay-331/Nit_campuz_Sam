import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { useSelector } from 'react-redux';
import { selectAllUsers } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student } from '../../../types';
import { selectUser } from '../../../store/slices/authSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Link } from 'react-router-dom';

const StudentMonitoring: React.FC = () => {
    const user = useSelector(selectUser);
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter(u => u.role === UserRole.STUDENT && (u as any).status !== StudentStatus.ALUMNI) as Student[], [users]);
    const [yearFilter, setYearFilter] = useState('');

    const deptStudents = useMemo(() => {
        const filtered = STUDENTS.filter(s => s.departmentId === user?.departmentId);
        if (yearFilter) {
            return filtered.filter(s => s.year.toString() === yearFilter);
        }
        return filtered;
    }, [user, yearFilter]);

    const availableYears = useMemo(() => {
        const years = STUDENTS
            .filter(s => s.departmentId === user?.departmentId)
            .map(s => s.year);
        return [...new Set(years)].sort();
    }, [user, STUDENTS]);

    const formatCgpa = (cgpa?: number) => {
        return Number.isFinite(cgpa) ? Number(cgpa).toFixed(2) : 'N/A';
    };

    const getAttendancePercentage = (studentId: string) => {
        // Mocking this data
        const hash = studentId.charCodeAt(studentId.length - 1);
        return 80 + (hash % 20); // Random-ish percentage between 80-99
    };

    const getInternalMarksStatus = (studentId: string) => {
        const hash = studentId.charCodeAt(1);
        return hash % 4 === 0 ? 'Pending' : 'Uploaded';
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold">Student Monitoring</h1>
                    <p className="text-slate-600">Track academic progress of students in your department.</p>
                </div>
                <div className="w-full sm:w-48">
                    <Select onValueChange={setYearFilter} value={yearFilter}>
                        <SelectTrigger><SelectValue placeholder="Filter by year..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Years</SelectItem>
                            {availableYears.map(year => <SelectItem key={year} value={String(year)}>{year}{year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Student Academic Overview</CardTitle>
                    <CardDescription>A summary of each student's key performance indicators.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>CGPA</TableHead>
                                    <TableHead>Attendance</TableHead>
                                    <TableHead>Internal Marks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deptStudents.map(student => {
                                    const attendance = getAttendancePercentage(student.id);
                                    const marksStatus = getInternalMarksStatus(student.id);
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                              <Link to={`/profile/${student.id}`} className="hover:opacity-80 transition-opacity">
                                                <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{student.name}</span>
                                              </Link>
                                            </TableCell>
                                            <TableCell>
                                              <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{student.year}</span>
                                            </TableCell>
                                            <TableCell>
                                              <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{formatCgpa(student.cgpa)}</span>
                                            </TableCell>
                                            <TableCell>
                                              <span className={`px-2 py-1 text-xs font-medium rounded-md bg-gray-100 ${attendance < 85 ? 'text-red-600' : 'text-gray-800'}`}>{attendance}%</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${marksStatus === 'Uploaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{marksStatus}</span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentMonitoring;
