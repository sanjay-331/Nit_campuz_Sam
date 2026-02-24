
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { DEPARTMENT_PASS_RATES } from '../../../constants';
import { selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { useSelector } from 'react-redux';
import { Student, UserRole, StudentStatus } from '../../../types';
import { DownloadIcon } from '../../icons/Icons';

const ReportsAnalytics: React.FC = () => {
    const users = useSelector(selectAllUsers);
    const STUDENTS = React.useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const DEPARTMENTS = useSelector(selectAllDepartments);

    const toppers = [...STUDENTS].sort((a, b) => b.cgpa - a.cgpa).slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-gray-500">Analyze performance and generate academic reports.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Department-wise Pass Percentage</CardTitle></CardHeader>
                    <CardContent>
                        <div className="w-full h-80">
                            <ResponsiveContainer>
                                <BarChart data={DEPARTMENT_PASS_RATES} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                                    <XAxis dataKey="name" tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false}/>
                                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false}/>
                                    <Tooltip 
                                        cursor={{fill: 'rgba(128, 128, 128, 0.05)'}}
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0', borderRadius: '1rem' }}
                                        formatter={(value) => [`${value}%`, "Pass Rate"]}
                                    />
                                    <Bar dataKey="passPercentage" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Generate Reports</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-semibold">Export Results</h4>
                            <p className="text-sm text-gray-500 mb-3">Download complete semester results in various formats.</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" leftIcon={<DownloadIcon className="w-4 h-4" />}>PDF</Button>
                                <Button size="sm" variant="secondary" leftIcon={<DownloadIcon className="w-4 h-4" />}>Excel</Button>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-semibold">Generate Rank List</h4>
                            <p className="text-sm text-gray-500 mb-3">Create and view the official university/college rank list.</p>
                            <Button size="sm">Generate Rank List</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Toppers List</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>CGPA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {toppers.map((student, index) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{DEPARTMENTS.find(d => d.id === student.departmentId)?.name}</TableCell>
                                    <TableCell className="font-semibold">{student.cgpa.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsAnalytics;
