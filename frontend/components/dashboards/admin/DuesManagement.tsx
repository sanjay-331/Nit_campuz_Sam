import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Switch } from '../../ui/Switch';
import { AppDispatch } from '../../../store';
import { selectAllUsers, updateDuesStatusRequest } from '../../../store/slices/appSlice';
import { Student, UserRole, StudentStatus } from '../../../types';
import EmptyState from '../../shared/EmptyState';

const DuesManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const allUsers = useSelector(selectAllUsers);

    const usersWithDues = useMemo(() => {
        return allUsers.filter(u => u.status !== StudentStatus.ALUMNI);
    }, [allUsers]);

    const handleDueChange = (userId: string, dueType: 'library' | 'department' | 'accounts', status: boolean) => {
        dispatch(updateDuesStatusRequest({ userId, dueType, status }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dues Management</h1>
                    <p className="text-slate-500 font-medium">Clearance tracking for students and faculty across all departments.</p>
                </div>
            </div>
            
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-visible">
                <CardHeader className="border-b border-slate-100 bg-white/50 rounded-t-2xl">
                    <CardTitle className="text-xl text-indigo-900">Clearance Status</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {usersWithDues.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="py-4">Member Name</TableHead>
                                        <TableHead className="text-center font-bold">Role</TableHead>
                                        <TableHead className="text-center font-bold">Library</TableHead>
                                        <TableHead className="text-center font-bold">Department</TableHead>
                                        <TableHead className="text-center font-bold">Accounts</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usersWithDues.map(user => (
                                        <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                            <TableCell className="font-semibold text-slate-700 py-4">{user.name}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    user.role === UserRole.STUDENT 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <Switch checked={user.dues?.library || false} onCheckedChange={(checked) => handleDueChange(user.id, 'library', checked)} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <Switch checked={user.dues?.department || false} onCheckedChange={(checked) => handleDueChange(user.id, 'department', checked)} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <Switch checked={user.dues?.accounts || false} onCheckedChange={(checked) => handleDueChange(user.id, 'accounts', checked)} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState title="No Records" message="There are no active users to manage dues for." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DuesManagement;