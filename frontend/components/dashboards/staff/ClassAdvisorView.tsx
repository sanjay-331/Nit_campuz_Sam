import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllClasses, selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { Student, UserRole } from '../../../types';
import EmptyState from '../../shared/EmptyState';

const ClassAdvisorView: React.FC = () => {
    const user = useSelector(selectUser);
    const allUsers = useSelector(selectAllUsers);
    const classes = useSelector(selectAllClasses);
    const DEPARTMENTS = useSelector(selectAllDepartments);

    const myAdvisoryClass = useMemo(() => {
        if (!user) return null;
        return classes.find(c => c.advisorId === user.id);
    }, [user, classes]);

    const myStudents = useMemo(() => {
        if (!myAdvisoryClass) return [];
        return allUsers.filter(u => 
            u.role === UserRole.STUDENT && 
            u.departmentId === myAdvisoryClass.departmentId &&
            (u as Student).year === myAdvisoryClass.year
        ) as Student[];
    }, [myAdvisoryClass, allUsers]);
    
    const department = myAdvisoryClass ? DEPARTMENTS.find(d => d.id === myAdvisoryClass.departmentId) : null;

    const getYearText = (year?: number) => {
        if (!year) return '';
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
                <h1 className="text-3xl font-bold">Class Advisor Dashboard</h1>
                <p className="text-gray-500">
                    {myAdvisoryClass 
                        ? `You are the advisor for the ${getYearText(myAdvisoryClass.year)}, ${department?.name}.`
                        : "You are not currently assigned as a class advisor."
                    }
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>My Advisees ({myStudents.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {myStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>CGPA</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myStudents.map(student => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                <Link to={`/profile/${student.id}`} className="text-indigo-600 hover:underline">
                                                    {student.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>{student.cgpa.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState title="No Students Found" message="There are no students assigned to your advisory class yet." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ClassAdvisorView;
