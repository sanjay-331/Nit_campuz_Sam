import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { PlusIcon, ChevronLeftIcon, TrashIcon } from '../../icons/Icons';
import { ExamSchedule, UserRole, StudentStatus, Student } from '../../../types';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { selectAllExamSchedules, addExamSchedulesRequest, selectAllUsers, selectAllCourses, selectAllDepartments } from '../../../store/slices/appSlice';


// SEMESTER EXAM FORM COMPONENT
const SemesterExamForm: React.FC<{ onAddSchedules: (schedules: ExamSchedule[]) => void; }> = ({ onAddSchedules }) => {
    const [departmentId, setDepartmentId] = useState('');
    const [year, setYear] = useState('');
    const [courseSchedules, setCourseSchedules] = useState<Record<string, Partial<ExamSchedule>>>({});

    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const COURSES = useSelector(selectAllCourses);

    const availableYears = useMemo(() => {
        if (!departmentId) return [];
        const years = STUDENTS
            .filter(s => s.departmentId === departmentId)
            .map(s => s.year);
        return [...new Set(years)].sort();
    }, [departmentId]);
    
    const coursesForYear = useMemo(() => {
        if (!departmentId || !year) return [];
        // A simple implementation: for a given year, show all department courses.
        // A more complex app would filter by semester-specific courses.
        return COURSES.filter(c => c.departmentId === departmentId); 
    }, [departmentId, year]);

    const handleInputChange = (courseId: string, field: keyof ExamSchedule, value: string) => {
        setCourseSchedules(prev => ({
            ...prev,
            [courseId]: {
                ...prev[courseId],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        const newSchedules: ExamSchedule[] = coursesForYear.map(course => {
            const scheduleData = courseSchedules[course.id] || {};
            return {
                id: `es-${Date.now()}-${course.id}`,
                courseCode: course.code,
                courseName: course.name,
                date: scheduleData.date || '',
                time: scheduleData.time || '',
                duration: scheduleData.duration || '3 Hours',
                hall: scheduleData.hall || '',
            };
        }).filter(s => s.date && s.time && s.hall); // Only save schedules with complete info
        
        onAddSchedules(newSchedules);
    };

    return (
        <Card className="overflow-visible">
            <CardHeader>
                <CardTitle>Create Semester Exam Schedule</CardTitle>
                <CardDescription>Select a department and year to generate a schedule for all relevant courses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                        <SelectTrigger><SelectValue placeholder="Select Department..." /></SelectTrigger>
                        <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                     <Select value={year} onValueChange={setYear}>
                        <SelectTrigger disabled={!departmentId}><SelectValue placeholder="Select Year..." /></SelectTrigger>
                        <SelectContent>{availableYears.map(y => <SelectItem key={y} value={String(y)}>{y}{y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                {coursesForYear.length > 0 && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Hall</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coursesForYear.map(course => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.name} ({course.code})</TableCell>
                                        <TableCell><Input type="date" className="h-9 min-w-[140px]" onChange={(e) => handleInputChange(course.id, 'date', e.target.value)} /></TableCell>
                                        <TableCell><Input type="time" className="h-9 min-w-[120px]" onChange={(e) => handleInputChange(course.id, 'time', e.target.value)} /></TableCell>
                                        <TableCell><Input placeholder="e.g. A-101" className="h-9 min-w-[100px]" onChange={(e) => handleInputChange(course.id, 'hall', e.target.value)} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={coursesForYear.length === 0}>Save Schedule</Button>
                </div>
            </CardContent>
        </Card>
    );
};


// INTERNAL EXAM FORM COMPONENT
const InternalExamForm: React.FC<{ onAddSchedules: (schedules: ExamSchedule[]) => void; }> = ({ onAddSchedules }) => {
    const [tempSchedules, setTempSchedules] = useState<ExamSchedule[]>([]);
    const [departmentId, setDepartmentId] = useState('');
    const [year, setYear] = useState('');
    const [courseId, setCourseId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const COURSES = useSelector(selectAllCourses);

    const availableYears = useMemo(() => {
        if (!departmentId) return [];
        const years = STUDENTS.filter(s => s.departmentId === departmentId).map(s => s.year);
        return [...new Set(years)].sort();
    }, [departmentId]);

    const availableCourses = useMemo(() => {
        if (!departmentId || !year) return [];
        return COURSES.filter(c => c.departmentId === departmentId);
    }, [departmentId, year]);

    const handleAddToList = () => {
        const course = COURSES.find(c => c.id === courseId);
        if (!course || !date || !time) return;

        const newSchedule: ExamSchedule = {
            id: `es-int-${Date.now()}`,
            courseCode: course.code,
            courseName: course.name,
            date,
            time,
            duration: '1.5 Hours',
            hall: 'Department Classroom',
        };
        setTempSchedules(prev => [...prev, newSchedule]);
        // Reset form for next entry
        setCourseId('');
        setDate('');
        setTime('');
    };

    const handleRemoveFromList = (id: string) => {
        setTempSchedules(prev => prev.filter(s => s.id !== id));
    };

    const handleSaveAll = () => {
        onAddSchedules(tempSchedules);
        setTempSchedules([]);
    };

    return (
        <Card className="overflow-visible">
            <CardHeader>
                <CardTitle>Create Internal Exam Schedule</CardTitle>
                <CardDescription>Add individual internal exams to build a schedule before saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl space-y-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select value={departmentId} onValueChange={v => { setDepartmentId(v); setYear(''); setCourseId(''); }}>
                            <SelectTrigger><SelectValue placeholder="Select Department..." /></SelectTrigger>
                            <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={year} onValueChange={v => { setYear(v); setCourseId(''); }}>
                            <SelectTrigger disabled={!departmentId}><SelectValue placeholder="Select Year..." /></SelectTrigger>
                            <SelectContent>{availableYears.map(y => <SelectItem key={y} value={String(y)}>{y}{y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger disabled={!year}><SelectValue placeholder="Select Course..." /></SelectTrigger>
                                <SelectContent>{availableCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={!courseId} />
                        <Input type="time" value={time} onChange={e => setTime(e.target.value)} disabled={!courseId} />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleAddToList} disabled={!courseId || !date || !time}>Add to List</Button>
                    </div>
                </div>

                {tempSchedules.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Scheduled Internals</h4>
                        <div className="space-y-2">
                            {tempSchedules.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                    <div>
                                        <p className="font-medium">{s.courseName} ({s.courseCode})</p>
                                        <p className="text-sm text-gray-500">{s.date} at {s.time}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="!p-1.5 text-red-500 hover:bg-red-50" onClick={() => handleRemoveFromList(s.id)}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 <div className="flex justify-end">
                    <Button onClick={handleSaveAll} disabled={tempSchedules.length === 0}>Save Schedule</Button>
                </div>
            </CardContent>
        </Card>
    );
};


// ADD SCHEDULE VIEW COMPONENT
const AddScheduleView: React.FC<{ onBack: () => void; onAddSchedules: (schedules: ExamSchedule[]) => void; }> = ({ onBack, onAddSchedules }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="!p-2" onClick={onBack}>
                        <ChevronLeftIcon className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Add New Exam Schedule</h1>
                        <p className="text-gray-500">Create timetables for internal or semester exams.</p>
                    </div>
                </div>

                <Tabs defaultValue="internal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="internal">Internal Exam</TabsTrigger>
                        <TabsTrigger value="semester">Semester Exam</TabsTrigger>
                    </TabsList>
                    <TabsContent value="internal">
                        <InternalExamForm onAddSchedules={onAddSchedules} />
                    </TabsContent>
                    <TabsContent value="semester">
                        <SemesterExamForm onAddSchedules={onAddSchedules} />
                    </TabsContent>
                </Tabs>
            </motion.div>
        </AnimatePresence>
    );
};


// MAIN COMPONENT
const ExamSchedules: React.FC = () => {
    const schedules = useSelector(selectAllExamSchedules);
    const dispatch = useDispatch<AppDispatch>();
    const [view, setView] = useState<'list' | 'add'>('list');

    const handleAddSchedules = (newSchedules: ExamSchedule[]) => {
        dispatch(addExamSchedulesRequest(newSchedules));
        setView('list');
    };

    if (view === 'add') {
        return <AddScheduleView onBack={() => setView('list')} onAddSchedules={handleAddSchedules} />;
    }

    return (
        <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Exam Management</h1>
                    <p className="text-gray-500">Add, edit, and manage exam schedules and hall allocations.</p>
                </div>
                <Button size="sm" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => setView('add')}>
                    Add Schedule
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Exam Schedules</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Hall</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map(schedule => (
                                    <TableRow key={schedule.id}>
                                        <TableCell className="font-mono text-sm">{schedule.courseCode}</TableCell>
                                        <TableCell className="font-medium">{schedule.courseName}</TableCell>
                                        <TableCell>{schedule.date}</TableCell>
                                        <TableCell>{schedule.time}</TableCell>
                                        <TableCell>{schedule.hall}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ExamSchedules;