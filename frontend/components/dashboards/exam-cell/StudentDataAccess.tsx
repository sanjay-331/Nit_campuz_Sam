import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Input } from '../../ui/Input';
import Button from '../../ui/Button';
import { SearchIcon, DownloadIcon } from '../../icons/Icons';
import { selectAllMarks, selectAllCourses, selectAllDepartments, selectAllUsers } from '../../../store/slices/appSlice';
import { Student, UserRole, StudentStatus } from '../../../types';
import EmptyState from '../../shared/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';

const StudentDataAccess: React.FC = () => {
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const MARKS = useSelector(selectAllMarks);
    const COURSES = useSelector(selectAllCourses);
    const DEPARTMENTS = useSelector(selectAllDepartments);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const foundStudent = STUDENTS.find(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSelectedStudent(foundStudent || null);
    };

    const studentMarks = useMemo(() => {
        if (!selectedStudent) return [];
        return MARKS.filter(m => m.studentId === selectedStudent.id);
    }, [selectedStudent]);
    
    const department = useMemo(() => {
        if (!selectedStudent) return null;
        return DEPARTMENTS.find(d => d.id === selectedStudent.departmentId);
    }, [selectedStudent]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Student Data Access</h1>
                <p className="text-gray-500">Search for a student to view their full academic record.</p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                placeholder="Search by name or email..."
                                className="pl-11"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                </CardContent>
            </Card>

            {selectedStudent ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-start">
                            <div>
                                <CardTitle>{selectedStudent.name}</CardTitle>
                                <p className="text-sm text-gray-500">{department?.name} - Year {selectedStudent.year}</p>
                            </div>
                            <Button size="sm" variant="secondary" leftIcon={<DownloadIcon className="w-4 h-4" />}>
                                Download Transcript
                            </Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold">{selectedStudent.cgpa.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">CGPA</p>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold">92%</p>
                                <p className="text-xs text-gray-500">Attendance</p>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-xs text-gray-500">Arrears</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold">{selectedStudent.status}</p>
                                <p className="text-xs text-gray-500">Status</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Academic Record</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Internal</TableHead>
                                            <TableHead>Exam</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Grade Point</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentMarks.map(mark => {
                                            const course = COURSES.find(c => c.id === mark.courseId);
                                            return (
                                                <TableRow key={mark.courseId}>
                                                    <TableCell className="font-medium">{course?.name} ({course?.code})</TableCell>
                                                    <TableCell>{mark.semester}</TableCell>
                                                    <TableCell>{mark.internal}</TableCell>
                                                    <TableCell>{mark.exam}</TableCell>
                                                    <TableCell className="font-semibold">{mark.grade}</TableCell>
                                                    <TableCell className="font-semibold">{mark.gradePoint.toFixed(1)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <EmptyState title="No Student Selected" message="Your search results will appear here." />
            )}
        </div>
    );
};

export default StudentDataAccess;