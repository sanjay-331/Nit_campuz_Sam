import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { selectAllAttendance, selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { UserRole, Student } from '../../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';

const AttendanceAnalytics: React.FC = () => {
    const allAttendance = useSelector(selectAllAttendance);
    const allUsers = useSelector(selectAllUsers);
    const allDepartments = useSelector(selectAllDepartments);

    const [filters, setFilters] = useState({ year: 'all', section: 'all' });

    const departmentAttendance = useMemo(() => {
        return allDepartments.map(dept => {
            const deptStudents = allUsers
                .filter(u => 
                    u.role === UserRole.STUDENT && 
                    u.departmentId === dept.id &&
                    (filters.year === 'all' || (u as Student).year === Number(filters.year)) &&
                    (filters.section === 'all' || (u as Student).section === filters.section)
                );
            
            const deptStudentIds = deptStudents.map(u => u.id);
            const deptAttendanceRecords = allAttendance.filter(a => deptStudentIds.includes(a.studentId));
            
            if (deptAttendanceRecords.length === 0) {
                return { name: dept.name, "Average Attendance": 0 };
            }
            
            const presentCount = deptAttendanceRecords.filter(a => a.present).length;
            const avg = Math.round((presentCount / deptAttendanceRecords.length) * 100);

            return { name: dept.name, "Average Attendance": avg };
        });
    }, [allAttendance, allUsers, allDepartments, filters]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Attendance Analytics</h1>
                    <p className="text-slate-500 font-medium">Analyze attendance trends with granular filters.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={filters.year} onValueChange={(v) => setFilters(prev => ({...prev, year: v}))}>
                        <SelectTrigger className="w-[120px] bg-white"><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.section} onValueChange={(v) => setFilters(prev => ({...prev, section: v}))}>
                        <SelectTrigger className="w-[120px] bg-white"><SelectValue placeholder="Section" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sections</SelectItem>
                            <SelectItem value="A">Section A</SelectItem>
                            <SelectItem value="B">Section B</SelectItem>
                            <SelectItem value="C">Section C</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-xl text-indigo-900 font-bold">Department-wise Average Attendance Percentage</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="w-full h-96">
                        <ResponsiveContainer>
                            <BarChart data={departmentAttendance} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value}%`, "Avg Attendance"]}
                                />
                                <Bar dataKey="Average Attendance" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceAnalytics;