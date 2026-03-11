import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { useSelector } from 'react-redux';
import { selectAllDepartments, selectAllUsers } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student } from '../../../types';
import Button from '../../ui/Button';
import { useNavigate } from 'react-router-dom';

const PrincipalHome: React.FC = () => {
    const navigate = useNavigate();
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const users = useSelector(selectAllUsers);
    const STUDENTS = users.filter(u => u.role === UserRole.STUDENT && (u as any).status !== StudentStatus.ALUMNI) as Student[];

    const departmentPerformance = DEPARTMENTS.map(dept => {
        const deptStudents = STUDENTS.filter(s => s.departmentId === dept.id);
        const avgCgpa = deptStudents.length > 0 ? (deptStudents.reduce((acc, s) => acc + s.cgpa, 0) / deptStudents.length) : 0;
        return { name: dept.name, "Average CGPA": parseFloat(avgCgpa.toFixed(2)) };
    });

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Principal Dashboard</h1>
            <p className="text-gray-500">High-level overview of institutional performance.</p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>Department-wise Performance (CGPA)</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="w-full h-80">
                <ResponsiveContainer>
                <BarChart data={departmentPerformance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                    <XAxis dataKey="name" tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0, 10]} tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false}/>
                    <Tooltip 
                     cursor={{fill: 'rgba(128, 128, 128, 0.05)'}}
                     contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '1rem',
                      }}
                      itemStyle={{ color: '#0f172a' }}
                    />
                    <Bar dataKey="Average CGPA" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm"><span>Computer Science</span><span className="font-semibold text-gray-800">95%</span></li>
                        <li className="flex justify-between items-center text-sm"><span>Mechanical Eng.</span><span className="font-semibold text-gray-800">91%</span></li>
                        <li className="flex justify-between items-center text-sm"><span>Civil Eng.</span><span className="font-semibold text-gray-800">88%</span></li>
                    </ul>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Quick Reports</CardTitle></CardHeader>
                <CardContent className="flex flex-col space-y-3">
                   <Button className="w-full" onClick={() => navigate('/reports')}>
                        Export Performance
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => navigate('/reports')}>
                        Export Attendance
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default PrincipalHome;