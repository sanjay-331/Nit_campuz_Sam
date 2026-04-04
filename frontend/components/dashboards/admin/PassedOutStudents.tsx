import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { AppDispatch } from '../../../store';
import { selectAllUsers, fetchUsersRequest } from '../../../store/slices/appSlice';
import { StudentStatus, UserRole } from '../../../types';
import EmptyState from '../../shared/EmptyState';
import Button from '../../ui/Button';
import { DownloadIcon } from '../../icons/Icons';

const PassedOutStudents: React.FC = () => {
    const users = useSelector(selectAllUsers);

    const passedOutStudents = useMemo(() => {
        return users.filter(u => u.status === StudentStatus.PASSED_OUT);
    }, [users]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Passed Out Students</h1>
                    <p className="text-slate-500 font-medium">Archive of students who have completed their graduation requirements.</p>
                </div>
                <Button variant="secondary" leftIcon={<DownloadIcon className="w-4 h-4"/>}>Export Alumni List</Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/90 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-800">Student Archive ({passedOutStudents.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {passedOutStudents.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="py-4">Student Name</TableHead>
                                    <TableHead className="text-center font-bold">Reg No</TableHead>
                                    <TableHead className="text-center font-bold">Year of Graduation</TableHead>
                                    <TableHead className="text-center font-bold">Department</TableHead>
                                    <TableHead className="text-center font-bold">Final Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {passedOutStudents.map(student => (
                                    <TableRow key={student.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                        <TableCell className="font-semibold text-slate-700 py-4">{student.name}</TableCell>
                                        <TableCell className="text-center font-mono">{(student as any).regNo}</TableCell>
                                        <TableCell className="text-center">{new Date().getFullYear()}</TableCell>
                                        <TableCell className="text-center">{(student as any).departmentId || 'N/A'}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">PASSED OUT</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyState title="No Records" message="There are currently no students marked as Passed Out." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PassedOutStudents;
