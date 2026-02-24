import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { useSelector } from 'react-redux';
import { selectAllCourses, selectAllDepartments, selectAllUsers, selectAllClasses } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student } from '../../../types';
import { selectUser } from '../../../store/slices/authSlice';
import StatCard from '../../dashboard/StatCard';
import { BookOpenIcon, ClockIcon, UsersIcon } from '../../icons/Icons';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';

const StaffHome: React.FC = () => {
    const user = useSelector(selectUser);
    const classes = useSelector(selectAllClasses);
    const COURSES = useSelector(selectAllCourses);
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter(u => u.role === UserRole.STUDENT && (u as any).status !== StudentStatus.ALUMNI) as Student[], [users]);

    const advisoryClass = useMemo(() => {
        if (!user) return null;
        const assignedClass = classes.find(c => c.advisorId === user.id);
        if (!assignedClass) return null;

        const department = DEPARTMENTS.find(d => d.id === assignedClass.departmentId);
        return {
            ...assignedClass,
            departmentName: department?.name || 'Unknown Department'
        };
    }, [user, classes]);

    const myCourses = COURSES.filter(c => c.staffId === user?.id);
    const myStudentIds = new Set(STUDENTS
        .filter(s => myCourses.some(c => c.departmentId === s.departmentId))
        .map(s => s.id)
    );

  const getYearText = (year: number) => {
        switch (year) {
            case 2: return '2nd Year';
            case 3: return '3rd Year';
            case 4: return 'Final Year';
            default: return `${year}th Year`;
        }
    }

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold">Staff Dashboard</h1>
            <p className="text-gray-500">Your central hub for managing classes and students.</p>
        </div>

        {advisoryClass && (
            <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                        <p className="font-semibold text-indigo-800">
                            You are the Class Advisor for the {getYearText(advisoryClass.year)}, {advisoryClass.departmentName}.
                        </p>
                        <p className="text-sm text-indigo-600">You can monitor their progress from the HOD's dashboard view.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Assigned Courses" value={myCourses.length} icon={<BookOpenIcon className="w-6 h-6"/>} color="indigo" />
            <StatCard title="Total Students" value={myStudentIds.size} icon={<UsersIcon className="w-6 h-6"/>} color="sky"/>
            <StatCard title="Today's Classes" value={3} icon={<ClockIcon className="w-6 h-6"/>} color="amber"/>
             <Card>
                <CardContent className="flex flex-col justify-center h-full">
                    <Link to="/attendance">
                        <Button className="w-full">Mark Attendance</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {myCourses.map(course => (
                <div key={course.id} className="p-4 border rounded-xl bg-gray-50 border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6"/>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">{course.name} ({course.code})</h4>
                            <p className="text-sm text-gray-500">{STUDENTS.filter(s => s.departmentId === course.departmentId).length} Students</p>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default StaffHome;