import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/Card';
import { BookOpenIcon, ClockIcon, HeartIcon, UserIcon, PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon, XIcon, AcademicCapIcon, BarChartIcon } from '../../icons/Icons';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import { selectAllSubmissions, selectAllClasses, selectAllUsers, selectAllMentorAssignments, selectAllCourses, selectAllAssignments, selectAllMarks } from '../../../store/slices/appSlice';
import { Student } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { AnimatePresence, motion } from 'framer-motion';

// --- TodoList Component ---
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, text: 'Review Data Structures notes', completed: true },
        { id: 2, text: 'Start Algorithms assignment', completed: false },
        { id: 3, text: 'Prepare for Thermodynamics quiz', completed: false },
    ]);
    const [newTask, setNewTask] = useState('');
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<{ id: number; text: string } | null>(null);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim() === '') return;
        setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const completedTasksCount = tasks.filter(t => t.completed).length;

    const handleClearCompleted = () => {
        setTasks(tasks.filter(task => !task.completed));
        setConfirmOpen(false);
    };

    const handleStartEdit = (task: Task) => {
        setEditingTask({ id: task.id, text: task.text });
    };

    const handleSaveEdit = () => {
        if (!editingTask || editingTask.text.trim() === '') return;
        setTasks(tasks.map(task =>
            task.id === editingTask.id ? { ...task, text: editingTask.text.trim() } : task
        ));
        setEditingTask(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSaveEdit();
        else if (e.key === 'Escape') setEditingTask(null);
    };

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear Completed Tasks</DialogTitle>
                        <DialogDescription>Are you sure you want to delete all {completedTasksCount} completed tasks?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleClearCompleted}>Clear Tasks</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CardHeader className="flex flex-row items-center justify-between py-4 bg-slate-50/50 border-b">
                <CardTitle className="text-base font-bold">My Personal Todo</CardTitle>
                {completedTasksCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)} className="text-rose-500 hover:bg-rose-50 h-8">
                       <TrashIcon className="w-3.5 h-3.5 mr-1.5" /> Clear
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-4">
                <AnimatePresence initial={false}>
                    {tasks.length > 0 ? (
                        <ul className="space-y-1 max-h-48 overflow-y-auto pr-1 thin-scrollbar">
                            {tasks.map((task) => {
                                const isEditing = editingTask?.id === task.id;
                                return (
                                <motion.li
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-3 p-2 group rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                                        disabled={isEditing}
                                    />
                                    {isEditing ? (
                                        <Input
                                            type="text"
                                            value={editingTask.text}
                                            onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                            onKeyDown={handleEditKeyDown}
                                            className="flex-1 h-8 py-0 text-sm border-none shadow-none focus-visible:ring-0 bg-transparent p-0"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className={`flex-1 text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                                            {task.text}
                                        </span>
                                    )}
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isEditing ? (
                                            <button onClick={handleSaveEdit} className="p-1 hover:bg-green-50 rounded-lg text-green-600"><CheckCircleIcon className="w-4 h-4" /></button>
                                        ) : (
                                            <button onClick={() => handleStartEdit(task)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"><PencilIcon className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </motion.li>
                            )})}
                        </ul>
                    ) : (
                         <div className="text-center py-6 text-slate-400">
                            <p className="text-xs font-medium">No tasks yet. Add one balance!</p>
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <form onSubmit={handleAddTask} className="flex gap-2 w-full">
                    <Input
                        placeholder="New goal..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="h-9 text-sm bg-slate-50 border-slate-200"
                    />
                    <Button type="submit" className="h-9 w-9 p-0 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700">
                        <PlusIcon className="w-4 h-4 text-white" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

// --- Main StudentHome Component ---
const StudentHome: React.FC = () => {
    const user = useSelector(selectUser);
    const submissions = useSelector(selectAllSubmissions);
    const classes = useSelector(selectAllClasses);
    const allUsers = useSelector(selectAllUsers);
    const mentorAssignments = useSelector(selectAllMentorAssignments);
    const COURSES = useSelector(selectAllCourses);
    const ASSIGNMENTS = useSelector(selectAllAssignments);
    const MARKS = useSelector(selectAllMarks);

    if (!user) return null;
    const studentUser = user as Student;

    const myClassAdvisor = useMemo(() => {
        const myClass = classes.find(c => c.departmentId === user.departmentId && c.year === (user as Student).year);
        return myClass ? allUsers.find(u => u.id === myClass.advisorId) : null;
    }, [user, classes, allUsers]);

    const myMentor = useMemo(() => {
        const assignment = mentorAssignments.find(m => m.studentId === user.id);
        return assignment ? allUsers.find(u => u.id === assignment.mentorId) : null;
    }, [user, mentorAssignments, allUsers]);

    const enrolledCourses = useMemo(() => COURSES.filter(c => c.departmentId === user.departmentId), [user, COURSES]);
    
    const upcomingAssignments = useMemo(() => ASSIGNMENTS.filter(a => 
        enrolledCourses.some(c => c.id === a.courseId) && 
        !submissions.some(s => s.assignmentId === a.id && s.studentId === user.id)
    ).slice(0, 3), [enrolledCourses, ASSIGNMENTS, submissions, user]);
    
    const latestSemesterData = useMemo(() => {
        const studentMarks = MARKS.filter(m => m.studentId === user.id);
        if (studentMarks.length === 0) return null;
        const latestSemester = Math.max(...studentMarks.map(m => m.semester));
        const marksForSem = studentMarks.filter(m => m.semester === latestSemester);
        let pts = 0, crd = 0;
        marksForSem.forEach(m => {
            const c = COURSES.find(v => v.id === m.courseId);
            if (c) { pts += m.gradePoint * c.credits; crd += c.credits; }
        });
        return { semester: latestSemester, sgpa: crd > 0 ? (pts / crd).toFixed(2) : 'N/A' };
    }, [user, MARKS, COURSES]);

    const stats = [
        { label: 'Attendance', val: `${(studentUser as any).daysPresent || 0} / ${(studentUser as any).totalWorkingDays || 1}`, sub: 'Overall Attendance', icon: <BarChartIcon className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Cumulative GPA', val: ((studentUser as any).cgpa || 0.00).toFixed(2), sub: 'Academic Standing', icon: <AcademicCapIcon className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Latest SGPA', val: latestSemesterData?.sgpa || 'N/A', sub: `Semester ${latestSemesterData?.semester || ' - '}`, icon: <BookOpenIcon className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' }
    ];

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Hub</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest">Year {studentUser.year}</span>
                    </div>
                    <p className="text-slate-500 font-medium">Welcome back, <span className="text-indigo-600 font-bold">{user.name.split(' ')[0]}</span>. Here's your academic status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/attendance"><Button variant="secondary" className="bg-white border-slate-200 text-slate-600 rounded-xl h-10 px-4 text-xs font-bold">View Attendance</Button></Link>
                    <Link to="/grades"><Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 rounded-xl h-10 px-4 text-xs font-bold">Full Marksheet</Button></Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all`}>{s.icon}</div>
                            <CardContent className="p-6">
                                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-4`}>{s.icon}</div>
                                <p className="text-2xl font-black text-slate-900">{s.val}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                                <p className="text-xs text-slate-500 mt-3 font-medium flex items-center gap-1.5"><ClockIcon className="w-3 h-3" /> {s.sub}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="py-4 px-6 bg-slate-50/50 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Current Semester Courses</CardTitle>
                            <span className="text-xs font-bold text-slate-500 tracking-tighter uppercase">{enrolledCourses.length} Enrolled</span>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrolledCourses.map(course => (
                                    <motion.div 
                                        key={course.id} 
                                        className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                                        whileHover={{ y: -2 }}
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <BookOpenIcon className="w-6 h-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-800 text-sm truncate">{course.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{course.code}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="py-4 px-6 bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Support Faculty</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm flex-shrink-0">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Class Advisor</p>
                                        <p className="font-bold text-slate-900 leading-tight">{myClassAdvisor?.name || 'Not Assigned'}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 italic">Dept. Mentor</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold border-2 border-white shadow-sm flex-shrink-0">
                                        <HeartIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Academic Mentor</p>
                                        <p className="font-bold text-slate-900 leading-tight">{myMentor?.name || 'Not Assigned'}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 italic">Personal Support</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                     <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="py-4 px-6 bg-slate-50/50 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold">Upcoming Deadlines</CardTitle>
                             <ClockIcon className="w-5 h-5 text-slate-300" />
                        </CardHeader>
                        <CardContent className="p-4">
                            {upcomingAssignments.length > 0 ? (
                                <ul className="space-y-4">
                                    {upcomingAssignments.map(assignment => {
                                        const course = enrolledCourses.find(c => c.id === assignment.courseId);
                                        return (
                                            <li key={assignment.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
                                                    <PencilIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{assignment.title}</p>
                                                    <p className="text-[10px] font-medium text-slate-500 truncate">{course?.name}</p>
                                                    <p className="text-[10px] font-black text-rose-500 mt-1 uppercase tracking-tighter">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <div className="py-6 text-center">
                                    <CheckCircleIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-500">No pending assignments!</p>
                                </div>
                            )}
                            <Link to="/assignments" className="block mt-4">
                                <Button variant="secondary" className="w-full h-10 text-xs font-bold bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100">Browse All</Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <TodoList />
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
