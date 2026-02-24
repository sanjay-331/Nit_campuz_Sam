import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Switch } from '../../ui/Switch';
import { AppDispatch } from '../../../store';
import { selectAllUsers, updateDuesStatusRequest } from '../../../store/slices/appSlice';
import { Student, UserRole } from '../../../types';
import EmptyState from '../../shared/EmptyState';

const DuesManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const allUsers = useSelector(selectAllUsers);

    const students = useMemo(() => {
        return allUsers.filter(u => u.role === UserRole.STUDENT && u.status !== 'Alumni') as Student[];
    }, [allUsers]);

    const handleDueChange = (studentId: string, dueType: 'library' | 'department' | 'accounts', status: boolean) => {
        dispatch(updateDuesStatusRequest({ studentId, dueType, status }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dues Management</h1>
                <p className="text-gray-500">Manage student dues clearance for all departments.</p>
            </div>
            
            <Card>
                <CardHeader><CardTitle>Student Dues Status</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {students.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-center">Library</TableHead>
                                        <TableHead className="text-center">Department</TableHead>
                                        <TableHead className="text-center">Accounts</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell className="text-center">
                                                <Switch checked={student.dues.library} onCheckedChange={(checked) => handleDueChange(student.id, 'library', checked)} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch checked={student.dues.department} onCheckedChange={(checked) => handleDueChange(student.id, 'department', checked)} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch checked={student.dues.accounts} onCheckedChange={(checked) => handleDueChange(student.id, 'accounts', checked)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState title="No Students Found" message="There are no student records in the system." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DuesManagement;