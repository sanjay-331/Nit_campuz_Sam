import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { selectAllMarks, selectAllCourses, selectAllDepartments } from '../../../store/slices/appSlice';
import StatCard from '../../dashboard/StatCard';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Student, Mark, Course } from '../../../types';
import Button from '../../ui/Button';
import { DownloadIcon } from '../../icons/Icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/Dialog';
import EmptyState from '../../shared/EmptyState';

type SemesterData = {
    semester: number;
    marks: Mark[];
    sgpa: number;
};

const Marksheet = ({ semester, studentUser, department, courses }: { semester: SemesterData, studentUser: Student, department: any, courses: Course[] }) => (
    <div className="p-4 sm:p-6 border rounded-2xl bg-slate-50 shadow-inner space-y-6 printable-marksheet">
        <div className="text-center border-b pb-4">
            <h3 className="font-bold text-lg text-slate-800">Statement of Grades</h3>
            <p className="text-sm text-slate-500">Semester {semester.semester}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div className="sm:col-span-2">
                <p className="text-slate-500">Name</p>
                <p className="font-semibold text-slate-800">{studentUser.name}</p>
            </div>
            <div>
                <p className="text-slate-500">Roll Number</p>
                <p className="font-semibold text-slate-800">{studentUser.email.split('@')[0].toUpperCase()}</p>
            </div>
            <div className="sm:col-span-2">
                <p className="text-slate-500">Department</p>
                <p className="font-semibold text-slate-800">{department?.name}</p>
            </div>
            <div>
                <p className="text-slate-500">SGPA</p>
                <p className="font-semibold text-slate-800 text-lg text-indigo-600">{semester.sgpa.toFixed(2)}</p>
            </div>
        </div>

        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Internal</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Grade Point</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {semester.marks.map(mark => {
                        const course = courses.find(c => c.id === mark.courseId);
                        return(
                        <TableRow key={mark.courseId}>
                            <TableCell className="font-medium">{course?.name || 'Unknown Course'}</TableCell>
                            <TableCell>{course?.credits}</TableCell>
                            <TableCell>{mark.internal}</TableCell>
                            <TableCell>{mark.exam}</TableCell>
                            <TableCell className="font-semibold">{mark.grade}</TableCell>
                            <TableCell className="font-semibold">{mark.gradePoint.toFixed(1)}</TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </div>
    </div>
);


const Grades: React.FC = () => {
    const user = useSelector(selectUser);
    const MARKS = useSelector(selectAllMarks);
    const COURSES = useSelector(selectAllCourses);
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const [viewingSemester, setViewingSemester] = useState<SemesterData | null>(null);
    
    const myMarks = useMemo(() => {
        if (!user) return [];
        // Only show PUBLISHED marks to the student
        return MARKS.filter(m => m.studentId === user.id && m.status === 'PUBLISHED');
    }, [user, MARKS]);


    const semesters: SemesterData[] = useMemo(() => {
        if (myMarks.length === 0) return [];
        const semesterNumbers = [...new Set(myMarks.map(m => m.semester))].sort();
        return semesterNumbers.map(sem => {
            const marksForSem = myMarks.filter(m => m.semester === sem);
            
            let totalWeightedPoints = 0;
            let totalCredits = 0;

            marksForSem.forEach(mark => {
                const course = COURSES.find(c => c.id === mark.courseId);
                if (course) {
                    totalWeightedPoints += mark.gradePoint * course.credits;
                    totalCredits += course.credits;
                }
            });

            const sgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

            return {
                semester: sem,
                marks: marksForSem,
                sgpa: parseFloat(sgpa.toFixed(2)),
            };
        });
    }, [myMarks]);

    const chartData = semesters.map(s => ({ name: `Sem ${s.semester}`, SGPA: s.sgpa }));
    
    if (!user) return null;

    const studentUser = user as Student;
    const cgpa = studentUser.cgpa || 0;
    // Formula for percentage varies by University, using common Indian scale (CGPA * 9.5 or related)
    // However, keeping the existing logic but smoothing the display
    const cgpaPercentage = cgpa >= 0.75 ? (cgpa - 0.75) * 10 : (cgpa * 10);
    const department = DEPARTMENTS.find(d => d.id === studentUser.departmentId);

    const defaultSemester = semesters.length > 0 ? String(semesters[semesters.length - 1].semester) : '1';

    const handleDownload = () => {
        window.print();
    };

    if (myMarks.length === 0) {
        return (
             <div className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Grades & Performance</h1>
                        <p className="text-slate-500">Your official academic record and semester performance.</p>
                    </div>
                </div>
                <Card className="border-dashed border-2 py-12">
                    <CardContent>
                        <EmptyState 
                            title="No Academic Records Found"
                            message="Your semester marks have not been uploaded to the portal yet. Please contact the exam cell if you believe this is an error."
                        />
                    </CardContent>
                </Card>
             </div>
        )
    }

    return (
        <div className="space-y-6">
            <Dialog open={!!viewingSemester} onOpenChange={() => setViewingSemester(null)}>
                <DialogContent className="max-w-4xl no-print bg-slate-100/50 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle>Marksheet Preview</DialogTitle>
                        <DialogDescription>Statement of grades for Semester {viewingSemester?.semester}</DialogDescription>
                    </DialogHeader>
                    {viewingSemester && (
                        <div className="p-0 sm:p-2">
                            <Marksheet semester={viewingSemester} studentUser={studentUser} department={department} courses={COURSES} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Grades & Performance</h1>
                    <p className="text-slate-500">Comprehensive overview of your academic achievements.</p>
                </div>
                <div className="flex gap-2 no-print">
                     <Button variant="secondary" onClick={handleDownload} leftIcon={<DownloadIcon className="w-4 h-4" />}>
                        Generate PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                <Card className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 border-none shadow-lg shadow-indigo-100">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center text-white h-full min-h-[240px]">
                        <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-2">Overall Institutional CGPA</p>
                        <h2 className="text-6xl font-black mb-4 tracking-tighter">{cgpa.toFixed(2)}</h2>
                        <div className="px-4 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                            <p className="text-xs font-bold">
                                Equivalent to {cgpaPercentage.toFixed(1)}% Marks
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg">SGPA Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="w-full h-48">
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 10]} tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="SGPA" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                 </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Tabs defaultValue={defaultSemester}>
                <Card className="card-print">
                    <CardHeader>
                        <CardTitle>Semester-wise Marksheets</CardTitle>
                        <div className="w-full overflow-x-auto no-print">
                            <TabsList className="mt-4">
                                {Array.from({ length: 8 }, (_, i) => i + 1).map(semNum => {
                                    const hasData = semesters.some(s => s.semester === semNum);
                                    return (
                                        <TabsTrigger key={semNum} value={String(semNum)} disabled={!hasData}>
                                            Sem {semNum}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {semesters.map(semester => (
                            <TabsContent key={semester.semester} value={String(semester.semester)}>
                                <Marksheet semester={semester} studentUser={studentUser} department={department} courses={COURSES} />
                                
                                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 no-print">
                                    <Button variant="secondary" onClick={() => setViewingSemester(semester)}>View Marksheet</Button>
                                    <Button onClick={handleDownload} leftIcon={<DownloadIcon className="w-4 h-4" />}>Download (B&W)</Button>
                                </div>
                            </TabsContent>
                        ))}
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
};

export default Grades;