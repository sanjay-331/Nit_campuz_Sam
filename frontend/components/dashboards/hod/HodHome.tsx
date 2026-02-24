
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student, Staff } from '../../../types';
import { selectUser } from '../../../store/slices/authSlice';
import StatCard from '../../dashboard/StatCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';

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

const HodHome: React.FC = () => {
    const user = useSelector(selectUser);
    const users = useSelector(selectAllUsers);
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const STUDENTS = users.filter(u => u.role === UserRole.STUDENT && (u as any).status !== StudentStatus.ALUMNI) as Student[];
    const STAFF = users.filter(u => u.role === UserRole.STAFF || u.role === UserRole.HOD) as Staff[];
    
    const department = DEPARTMENTS.find(d => d.id === user?.departmentId);
    const deptStudents = STUDENTS.filter(s => s.departmentId === user?.departmentId);
    const deptStaff = STAFF.filter(s => s.departmentId === user?.departmentId);
    
    const avgCgpa = deptStudents.length > 0 
        ? (deptStudents.reduce((acc, s) => acc + s.cgpa, 0) / deptStudents.length).toFixed(2)
        : 'N/A';

    const studentPerformanceData = [...deptStudents]
        .sort((a,b) => b.cgpa - a.cgpa)
        .slice(0, 5)
        .map(s => ({ name: s.name.split(' ')[0], cgpa: s.cgpa }));

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold">{department?.name}</h1>
            <p className="text-gray-500">Department Overview</p>
        </div>

        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}><StatCard title="Total Students" value={deptStudents.length} /></motion.div>
            <motion.div variants={itemVariants}><StatCard title="Total Staff" value={deptStaff.length} /></motion.div>
            <motion.div variants={itemVariants}><StatCard title="Average CGPA" value={avgCgpa} /></motion.div>
            <motion.div variants={itemVariants}><StatCard title="Avg. Attendance" value="92%" /></motion.div>
        </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Top Student Performance (CGPA)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full h-80">
                    <ResponsiveContainer>
                        <BarChart data={studentPerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                            <XAxis dataKey="name" tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false}/>
                            <YAxis type="number" domain={[0, 10]} tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip
                              cursor={{fill: 'rgba(128, 128, 128, 0.05)'}}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                border: '1px solid #e2e8f0',
                                borderRadius: '1rem',
                              }}
                              itemStyle={{ color: '#0f172a' }}
                            />
                            <Bar dataKey="cgpa" fill="#2563eb" barSize={30} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    <Link to="/staff" className="w-full">
                        <Button variant="secondary" className="w-full !justify-start">View Staff Assignments</Button>
                    </Link>
                    <Link to="/students" className="w-full">
                        <Button variant="secondary" className="w-full !justify-start">Monitor Student Attendance</Button>
                    </Link>
                    <Link to="/resources" className="w-full">
                        <Button variant="secondary" className="w-full !justify-start">Allocate Lab Resources</Button>
                    </Link>
                    <Button variant="secondary" className="w-full !justify-start">
                        Generate Department Report
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HodHome;