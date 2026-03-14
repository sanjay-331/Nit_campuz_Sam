import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { selectAllCourses, selectAllAttendance } from '../../../store/slices/appSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClockIcon, CalendarIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon } from '../../icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';

const Attendance: React.FC = () => {
    const user = useSelector(selectUser);
    const COURSES = useSelector(selectAllCourses);
    const ALL_ATTENDANCE = useSelector(selectAllAttendance);
    
    const myAttendance = useMemo(() => {
        if (!user) return [];
        return ALL_ATTENDANCE.filter(a => a.studentId === user.id);
    }, [user, ALL_ATTENDANCE]);

    const enrolledCourses = useMemo(() => {
        if (!user) return [];
        return COURSES.filter(c => c.departmentId === user.departmentId);
    }, [user, COURSES]);

    const overallStats = useMemo(() => {
        if (myAttendance.length === 0) return { percentage: 0, total: 0, present: 0 };
        const presentCount = myAttendance.filter(a => a.present).length;
        return {
            present: presentCount,
            total: myAttendance.length,
            percentage: Math.round((presentCount / myAttendance.length) * 100)
        };
    }, [myAttendance]);

    const courseWiseAttendance = useMemo(() => {
        return enrolledCourses.map(course => {
            const courseAttendance = myAttendance.filter(a => a.courseId === course.id);
            if (courseAttendance.length === 0) {
                return { ...course, percentage: 0, total: 0, present: 0, requested: false };
            }
            const presentCount = courseAttendance.filter(a => a.present).length;
            const percentage = Math.round((presentCount / courseAttendance.length) * 100);
            return { ...course, percentage, total: courseAttendance.length, present: presentCount, requested: true };
        });
    }, [enrolledCourses, myAttendance]);

    // Grouping by date for Day-wise view
    const dayWiseAttendance = useMemo(() => {
        const groups: { [key: string]: typeof myAttendance } = {};
        myAttendance.forEach(a => {
            const dateStr = new Date(a.date).toISOString().split('T')[0];
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(a);
        });
        
        return Object.entries(groups).map(([date, records]) => ({
            date,
            records: records.map(r => ({
                ...r,
                course: COURSES.find(c => c.id === r.courseId)
            }))
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [myAttendance, COURSES]);
    
    const chartData = courseWiseAttendance.filter(c => c.total > 0).map(c => ({ name: c.code, Attendance: c.percentage }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Record</h1>
                    <p className="text-slate-500 mt-1">Detailed track of your presence across all enrolled courses.</p>
                </div>
                <Card className="bg-indigo-600 border-none shadow-lg shadow-indigo-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <ClockIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-100 font-medium">Overall Attendance</p>
                            <p className="text-2xl font-bold text-white tracking-tight">{overallStats.percentage}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="course-wise">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="course-wise" className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Subject Wise</TabsTrigger>
                        <TabsTrigger value="day-wise" className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Day Wise</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="course-wise" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Attendance Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-72">
                                    <ResponsiveContainer>
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                cursor={{fill: '#f8fafc'}}
                                                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [`${value}%`, "Attendance"]}
                                            />
                                            <Bar dataKey="Attendance" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-600 font-medium">Total Classes</span>
                                    <span className="text-lg font-bold text-slate-800">{overallStats.total}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                    <span className="text-sm text-green-700 font-medium">Classes Attended</span>
                                    <span className="text-lg font-bold text-green-800">{overallStats.present}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                                    <span className="text-sm text-red-700 font-medium">Classes Missed</span>
                                    <span className="text-lg font-bold text-red-800">{overallStats.total - overallStats.present}</span>
                                </div>
                                <div className="pt-4 border-t">
                                     <div className={`p-4 rounded-xl text-center ${overallStats.percentage < 75 ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                                        <p className={`text-sm font-semibold ${overallStats.percentage < 75 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            {overallStats.percentage < 75 ? 'Attendance Below 75% Threshold' : 'Good Attendance Standing'}
                                        </p>
                                     </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courseWiseAttendance.map(course => (
                            <Card key={course.id} className="border-slate-200 hover:border-indigo-200 transition-colors shadow-sm overflow-hidden group">
                                <div className={`h-1.5 w-full ${course.percentage < 75 ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.name}</CardTitle>
                                            <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider">{course.code}</p>
                                        </div>
                                        <div className={`text-xl font-black ${course.percentage < 75 ? 'text-rose-500' : 'text-slate-800'}`}>
                                            {course.percentage}%
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-medium text-slate-500">
                                            <span>Presence Track</span>
                                            <span>{course.present} / {course.total} classes</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-2 rounded-full ${course.percentage < 75 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                            ></motion.div>
                                        </div>
                                        {course.total === 0 && <p className="text-[10px] text-slate-400 italic">No attendance records yet for this course.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="day-wise" className="space-y-4">
                    {dayWiseAttendance.length === 0 ? (
                        <Card className="border-dashed border-2 py-12 text-center">
                            <CardContent>
                                <p className="text-slate-400">No attendance history found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {dayWiseAttendance.map((day, idx) => (
                                <motion.div 
                                    key={day.date}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                                        <CardHeader className="bg-slate-50/50 py-3 flex flex-row items-center justify-between border-b">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-700">{day.date}</span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400">
                                                {day.records.length} Sessions
                                            </span>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-100">
                                                {day.records.map((rec, rIdx) => (
                                                    <div key={rIdx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-lg ${rec.present ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                <AcademicCapIcon className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{rec.course?.name || 'Unknown Course'}</p>
                                                                <p className="text-xs text-slate-400 font-medium">{rec.course?.code}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {rec.present ? (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                    Present
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                                    <XCircleIcon className="w-3.5 h-3.5" />
                                                                    Absent
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Attendance;