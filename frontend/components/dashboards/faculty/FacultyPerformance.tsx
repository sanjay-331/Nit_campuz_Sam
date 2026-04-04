import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { AppDispatch, RootState } from '../../../store';
import { fetchFacultyPerformanceRequest } from '../../../store/slices/appSlice';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { StarIcon, BookOpenIcon, UsersIcon, TrendingUpIcon } from '../../icons/Icons';

const FacultyPerformance: React.FC<{ facultyId: string }> = ({ facultyId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const performance = useSelector((state: RootState) => state.app.facultyPerformance);

    useEffect(() => {
        dispatch(fetchFacultyPerformanceRequest(facultyId));
    }, [dispatch, facultyId]);

    const radarData = useMemo(() => {
        if (!performance) return [];
        return [
            { subject: 'Avg Marks', A: performance.overallAvgGradePoint * 10, fullMark: 100 },
            { subject: 'Attendance', A: performance.overallAvgAttendance, fullMark: 100 },
            { subject: 'Syllabus', A: 90, fullMark: 100 }, // Mock syllabus completion
            { subject: 'Assignment', A: 85, fullMark: 100 }, // Mock assignment count
            { subject: 'Engagement', A: performance.performanceScore, fullMark: 100 },
        ];
    }, [performance]);

    if (!performance) return <p>Loading performance data...</p>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-indigo-600 text-white shadow-lg overflow-hidden relative">
                    <CardContent className="p-6">
                        <TrendingUpIcon className="absolute top-2 right-2 w-16 h-16 text-indigo-400 opacity-20" />
                        <div className="text-sm font-medium tracking-wide uppercase opacity-80">Aggregate Score</div>
                        <div className="text-4xl font-black mt-2">{performance.performanceScore}%</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white shadow-lg relative overflow-hidden">
                    <CardContent className="p-6">
                         <StarIcon className="absolute top-2 right-2 w-16 h-16 text-slate-800" />
                        <div className="text-sm font-medium tracking-wide uppercase opacity-80">Avg Class Marks</div>
                        <div className="text-4xl font-black mt-2">{performance.overallAvgGradePoint.toFixed(1)} <span className="text-sm opacity-60">/ 10</span></div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-lg border-none relative">
                    <CardContent className="p-6">
                         <UsersIcon className="absolute top-2 right-2 w-16 h-16 text-slate-50" />
                        <div className="text-sm font-medium tracking-wide text-slate-500 uppercase">Avg Attendance</div>
                        <div className="text-4xl font-black text-indigo-600 mt-2">{performance.overallAvgAttendance.toFixed(1)}%</div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-none shadow-lg relative">
                    <CardContent className="p-6">
                         <BookOpenIcon className="absolute top-2 right-2 w-16 h-16 text-indigo-100" />
                        <div className="text-sm font-medium tracking-wide text-indigo-600 uppercase">Courses Taught</div>
                        <div className="text-4xl font-black text-indigo-900 mt-2">{performance.courseMetrics?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm border-none bg-white">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <CardTitle className="text-slate-800">Course-wise Performance Metrics</CardTitle>
                        <CardDescription>Breakdown of average grade points and student attendance per module.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performance.courseMetrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="courseCode" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{fill: '#f8fafc'}}
                                />
                                <Legend wrapperStyle={{paddingTop: '20px'}} />
                                <Bar dataKey="avgGradePoint" name="Avg Marks (Scaled x10)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="avgAttendance" name="Avg Attendance %" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-indigo-900 text-white">
                    <CardHeader className="border-b border-indigo-800 pb-4">
                        <CardTitle>Skill Matrix</CardTitle>
                        <CardDescription className="text-indigo-300">Holistic performance assessment across key metrics.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center p-0">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <PolarGrid stroke="#4338ca" />
                                <PolarAngleAxis dataKey="subject" tick={{fill: '#fff', fontSize: 10}} />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="#818cf8"
                                    fill="#818cf8"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FacultyPerformance;
