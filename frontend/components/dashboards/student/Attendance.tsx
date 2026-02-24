import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { ATTENDANCE } from '../../../constants';
import { selectAllCourses } from '../../../store/slices/appSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Attendance: React.FC = () => {
    const user = useSelector(selectUser);
    const COURSES = useSelector(selectAllCourses);
    
    const myAttendance = useMemo(() => {
        if (!user) return [];
        return ATTENDANCE.filter(a => a.studentId === user.id);
    }, [user]);

    const enrolledCourses = useMemo(() => {
        if (!user) return [];
        return COURSES.filter(c => c.departmentId === user.departmentId);
    }, [user]);

    const overallPercentage = useMemo(() => {
        if (myAttendance.length === 0) return 0;
        const presentCount = myAttendance.filter(a => a.present).length;
        return Math.round((presentCount / myAttendance.length) * 100);
    }, [myAttendance]);

    const courseWiseAttendance = useMemo(() => {
        return enrolledCourses.map(course => {
            const courseAttendance = myAttendance.filter(a => a.courseId === course.id);
            if (courseAttendance.length === 0) {
                return { ...course, percentage: 100, total: 0, present: 0 };
            }
            const presentCount = courseAttendance.filter(a => a.present).length;
            const percentage = Math.round((presentCount / courseAttendance.length) * 100);
            return { ...course, percentage, total: courseAttendance.length, present: presentCount };
        });
    }, [enrolledCourses, myAttendance]);
    
    const chartData = courseWiseAttendance.map(c => ({ name: c.code, Attendance: c.percentage }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Attendance Record</h1>
                <p className="text-gray-500">An overview of your attendance in all courses.</p>
            </div>
            
            <Card>
                 <CardHeader>
                    <CardTitle>Course-wise Attendance (%)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-64">
                         <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                                <XAxis dataKey="name" tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(128, 128, 128, 0.05)'}}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0', borderRadius: '1rem' }}
                                    formatter={(value) => [`${value}%`, "Attendance"]}
                                />
                                <Bar dataKey="Attendance" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                             </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courseWiseAttendance.map(course => (
                    <Card key={course.id}>
                        <CardHeader>
                            <CardTitle>{course.name}</CardTitle>
                            <p className="text-sm text-gray-500">{course.code}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm font-medium text-gray-700">{course.present} / {course.total} classes</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className="bg-blue-600 h-2.5 rounded-full" 
                                            style={{ width: `${course.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className={`text-2xl font-bold ${course.percentage < 75 ? 'text-red-500' : 'text-gray-800'}`}>
                                    {course.percentage}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Attendance;