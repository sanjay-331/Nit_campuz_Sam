
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/Card';
import { BookOpenIcon, ClockIcon, HeartIcon, UserIcon, PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon, XIcon } from '../../icons/Icons';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import { selectAllSubmissions, selectAllClasses, selectAllUsers, selectAllMentorAssignments, selectAllCourses, selectAllAssignments, selectAllMarks } from '../../../store/slices/appSlice';
import { Student } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { AnimatePresence, motion } from 'framer-motion';

// --- START of new TodoList component ---
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
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            setEditingTask(null);
        }
    };

    return (
        <>
            <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear Completed Tasks</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete all {completedTasksCount} completed tasks?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleClearCompleted}>Clear Tasks</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My To-Do List</CardTitle>
                    {completedTasksCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                           <TrashIcon className="w-4 h-4 mr-2" />
                            Clear ({completedTasksCount})
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <AnimatePresence>
                        {tasks.length > 0 ? (
                            <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
                                {tasks.map((task) => {
                                    const isEditing = editingTask?.id === task.id;
                                    return (
                                    <motion.li
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-3 p-2 group rounded-lg hover:bg-slate-50"
                                    >
                                        <input
                                            type="checkbox"
                                            id={`task-${task.id}`}
                                            checked={task.completed}
                                            onChange={() => toggleTask(task.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                                            aria-label={task.text}
                                            disabled={isEditing}
                                        />
                                        {isEditing ? (
                                            <Input
                                                type="text"
                                                value={editingTask.text}
                                                onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                                onKeyDown={handleEditKeyDown}
                                                className="flex-1 h-auto py-0 text-sm border-none shadow-none focus-visible:ring-0 bg-transparent"
                                                autoFocus
                                            />
                                        ) : (
                                            <label
                                                htmlFor={`task-${task.id}`}
                                                className={`flex-1 text-sm cursor-pointer ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                                            >
                                                {task.text}
                                            </label>
                                        )}
                                        <div className="ml-auto flex items-center gap-1">
                                            {isEditing ? (
                                                <>
                                                    <Button size="sm" variant="ghost" className="!p-2" onClick={handleSaveEdit} aria-label="Save task">
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="!p-2" onClick={() => setEditingTask(null)} aria-label="Cancel edit">
                                                        <XIcon className="w-5 h-5 text-red-500" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="ghost" className="!p-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity" onClick={() => handleStartEdit(task)} aria-label="Edit task">
                                                    <PencilIcon className="w-4 h-4 text-slate-500" />
                                                </Button>
                                            )}
                                        </div>
                                    </motion.li>
                                )})}
                            </ul>
                        ) : (
                             <div className="text-center py-8">
                                <p className="text-sm text-slate-500">You're all done! No tasks left.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </CardContent>
                <CardFooter>
                    <form onSubmit={handleAddTask} className="flex gap-2 w-full">
                        <Input
                            placeholder="Add a new task..."
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                        />
                        <Button type="submit" className="!p-3" aria-label="Add Task">
                            <PlusIcon className="w-5 h-5" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </>
    );
};
// --- END of new TodoList component ---

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};


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
        if (!user || !('year' in user)) return null;
        const myClass = classes.find(c => c.departmentId === user.departmentId && c.year === (user as Student).year);
        if (!myClass) return null;
        return allUsers.find(u => u.id === myClass.advisorId);
    }, [user, classes, allUsers]);

    const myMentor = useMemo(() => {
        if (!user) return null;
        const assignment = mentorAssignments.find(m => m.studentId === user.id);
        if (!assignment) return null;
        return allUsers.find(u => u.id === assignment.mentorId);
    }, [user, mentorAssignments, allUsers]);


    const enrolledCourses = COURSES.filter(c => c.departmentId === user.departmentId);
    const upcomingAssignments = ASSIGNMENTS.filter(a => 
        enrolledCourses.some(c => c.id === a.courseId) && 
        !submissions.some(s => s.assignmentId === a.id && s.studentId === user.id)
    );
    
    const latestSemesterData = useMemo(() => {
        if (!user) return null;
        const studentMarks = MARKS.filter(m => m.studentId === user.id);
        if (studentMarks.length === 0) return null;

        const latestSemester = Math.max(...studentMarks.map(m => m.semester));
        const marksForSem = studentMarks.filter(m => m.semester === latestSemester);
        
        let totalWeightedPoints = 0;
        let totalCredits = 0;

        marksForSem.forEach(mark => {
            const course = COURSES.find(c => c.id === mark.courseId);
            if (course) {
                totalWeightedPoints += mark.gradePoint * course.credits;
                totalCredits += course.credits;
            }
        });

        const sgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : 'N/A';
        
        return {
            semester: latestSemester,
            sgpa: sgpa
        };
    }, [user]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user.name.split(' ')[0]}!</p>
            </div>

            <Card>
                <CardHeader><CardTitle>Academic Overview</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 font-medium">Attendance</p>
                        <p className="text-3xl font-bold text-slate-800">{(studentUser as any).daysPresent || 0} / {(studentUser as any).totalWorkingDays || 1}</p>
                        <p className="text-xs text-slate-500 font-medium">Days Present</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 font-medium">Overall CGPA</p>
                        <p className="text-3xl font-bold text-slate-800">{((studentUser as any).cgpa || (studentUser as any).studentProfile?.cgpa || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-500 font-medium">Cumulative Grade Point Average</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 font-medium">Latest Semester SGPA</p>
                        <p className="text-3xl font-bold text-slate-800">{latestSemesterData?.sgpa || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-medium">Semester {latestSemesterData?.semester || '-'}</p>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Enrolled Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {enrolledCourses.map(course => (
                                    <motion.div 
                                        key={course.id} 
                                        className="p-4 bg-gray-50 border rounded-xl flex items-center gap-4 cursor-pointer"
                                        whileHover={{ scale: 1.02, x: 2, transition: { type: 'spring', stiffness: 400 } }}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                            <BookOpenIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{course.name}</p>
                                            <p className="text-sm text-gray-500">{course.code}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Support Faculty</CardTitle>
                        </CardHeader>
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
                                <p className="text-sm text-gray-500">Your class advisor has not been assigned yet.</p>
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
                                <p className="text-sm text-gray-500">Your mentor has not been assigned yet.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingAssignments.length > 0 ? (
                                <ul className="space-y-4">
                                    {upcomingAssignments.map(assignment => {
                                        const course = enrolledCourses.find(c => c.id === assignment.courseId);
                                        return (
                                            <li key={assignment.id} className="flex items-start gap-3">
                                                <ClockIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{assignment.title}</p>
                                                    <p className="text-xs text-gray-500">{course?.name} - Due: {assignment.dueDate}</p>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No upcoming assignments. Great job!</p>
                            )}
                            <Link to="/assignments">
                                <Button variant="secondary" size="sm" className="w-full mt-4">View All Assignments</Button>
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
