import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { selectAllAttendance, selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { UserRole } from '../../../types';

const AttendanceAnalytics: React.FC = () => {
    const allAttendance = useSelector(selectAllAttendance);
    const allUsers = useSelector(selectAllUsers);
    const allDepartments = useSelector(selectAllDepartments);

    const departmentAttendance = useMemo(() => {
        return allDepartments.map(dept => {
            const deptStudentIds = allUsers
                .filter(u => u.role === UserRole.STUDENT && u.departmentId === dept.id)
                .map(u => u.id);

            const deptAttendanceRecords = allAttendance.filter(a => deptStudentIds.includes(a.studentId));
            
            if (deptAttendanceRecords.length === 0) {
                return { name: dept.name, "Average Attendance": 0 };
            }
            
            const presentCount = deptAttendanceRecords.filter(a => a.present).length;
            const avg = Math.round((presentCount / deptAttendanceRecords.length) * 100);

            return { name: dept.name, "Average Attendance": avg };
        });
    }, [allAttendance, allUsers, allDepartments]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Attendance Analytics</h1>
                <p className="text-gray-500">Analyze attendance trends across the institution.</p>
            </div>

            <Card>
                <CardHeader><CardTitle>Department-wise Average Attendance</CardTitle></CardHeader>
                <CardContent>
                    <div className="w-full h-96">
                        <ResponsiveContainer>
                            <BarChart data={departmentAttendance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                                <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(128, 128, 128, 0.05)' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0', borderRadius: '1rem' }}
                                    formatter={(value) => [`${value}%`, "Average Attendance"]}
                                />
                                <Bar dataKey="Average Attendance" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceAnalytics;