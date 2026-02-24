

import React from 'react';
import { useSelector } from 'react-redux';
import { selectAllUsers } from '../../../store/slices/appSlice';
import StatCard from '../../dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { UserRole, StudentStatus } from '../../../types';
import { motion } from 'framer-motion';
import Button from '../../ui/Button';
import { AcademicCapIcon, BriefcaseIcon, UsersIcon } from '../../icons/Icons';

const alumniIncreaseData = [
    { name: '2021', alumni: 40 }, { name: '2022', alumni: 55 },
    { name: '2023', alumni: 70 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};


const AdminHome: React.FC = () => {
    const users = useSelector(selectAllUsers);
    const students = users.filter(u => u.role === UserRole.STUDENT && (u as any).status !== StudentStatus.ALUMNI);
    const staff = users.filter(u => u.role === UserRole.STAFF);
    const alumni = users.filter(u => u.role === UserRole.STUDENT && (u as any).status === StudentStatus.ALUMNI);
    const hods = users.filter(s => s.role === UserRole.HOD).length;
    const quickActions = [
        "Promote Students",
        "Move Graduates to Alumni",
        "Sync with Workspace",
        "Generate Report"
    ];

    return (
        <div className="space-y-6">
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}><StatCard title="Total Students" value={students.length} icon={<UsersIcon className="w-6 h-6"/>} color="indigo" /></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Total Staff" value={staff.length} icon={<BriefcaseIcon className="w-6 h-6"/>} color="sky" /></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Total HODs" value={hods} icon={<AcademicCapIcon className="w-6 h-6"/>} color="amber" /></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Total Alumni" value={alumni.length} icon={<UsersIcon className="w-6 h-6"/>} color="green" /></motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent>
                       <motion.div 
                         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                         variants={containerVariants}
                         initial="hidden"
                         animate="visible"
                       >
                         {quickActions.map(action => (
                            <motion.div key={action} variants={itemVariants}>
                                <Button variant="secondary" className="w-full !justify-start !p-4 !font-medium">
                                    {action}
                                </Button>
                            </motion.div>
                         ))}
                        </motion.div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="text-sm p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <span className="font-semibold text-blue-800">Approval Needed:</span> New staff account for Prof. Davis.
                            </li>
                            <li className="text-sm p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <span className="font-semibold text-yellow-800">System Alert:</span> Database backup scheduled for 2 AM.
                            </li>
                             <li className="text-sm p-3 rounded-lg bg-red-50 border border-red-200">
                                <span className="font-semibold text-red-800">Action Required:</span> Exam cell account expiring in 3 days.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1">
                <Card>
                    <CardHeader><CardTitle>Alumni Increase Per Year</CardTitle></CardHeader>
                    <CardContent>
                        <div className="w-full h-64">
                            <ResponsiveContainer>
                                <BarChart data={alumniIncreaseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                                    <XAxis dataKey="name" tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }} />
                                    <Bar dataKey="alumni" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                 </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminHome;