import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllUsers, selectAllClasses, assignAdvisorRequest } from '../../../store/slices/appSlice';
import { Staff, UserRole } from '../../../types';

const AssignAdvisor: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const allUsers = useSelector(selectAllUsers);
    const classes = useSelector(selectAllClasses);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYear, setEditingYear] = useState<number | null>(null);
    const [selectedAdvisorId, setSelectedAdvisorId] = useState('');

    const departmentId = user?.departmentId;

    const departmentStaff = useMemo(() => {
        return allUsers.filter(u => u.departmentId === departmentId && (u.role === UserRole.STAFF || u.role === UserRole.HOD)) as Staff[];
    }, [allUsers, departmentId]);

    const handleOpenModal = (year: number) => {
        const currentAssignment = classes.find(c => c.departmentId === departmentId && c.year === year);
        setSelectedAdvisorId(currentAssignment?.advisorId || '');
        setEditingYear(year);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingYear(null);
        setSelectedAdvisorId('');
    };

    const handleSave = () => {
        if (!editingYear || !departmentId || !selectedAdvisorId) return;

        dispatch(assignAdvisorRequest({
            departmentId,
            year: editingYear,
            advisorId: selectedAdvisorId,
        }));
        handleCloseModal();
    };

    const yearsToManage = [2, 3, 4]; // 2nd, 3rd, Final year

    const getYearText = (year: number) => {
        switch (year) {
            case 2: return '2nd Year';
            case 3: return '3rd Year';
            case 4: return 'Final Year';
            default: return `${year}th Year`;
        }
    }

    return (
        <div className="space-y-6">
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Advisor for {getYearText(editingYear || 0)}</DialogTitle>
                        <DialogDescription>Select a faculty member to be the class advisor.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        <Select value={selectedAdvisorId} onValueChange={setSelectedAdvisorId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Faculty..." />
                            </SelectTrigger>
                            <SelectContent>
                                {departmentStaff.map(staff => (
                                    <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!selectedAdvisorId}>Save Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div>
                <h1 className="text-3xl font-bold">Assign Class Advisors</h1>
                <p className="text-slate-600">Manage class advisors for each year in your department.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Advisor Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Current Advisor</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {yearsToManage.map(year => {
                                    const assignment = classes.find(c => c.departmentId === departmentId && c.year === year);
                                    const advisor = assignment ? allUsers.find(u => u.id === assignment.advisorId) : null;
                                    return (
                                        <TableRow key={year}>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {getYearText(year)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {advisor ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {advisor.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">Not Assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="secondary" size="sm" onClick={() => handleOpenModal(year)}>
                                                    {advisor ? 'Change' : 'Assign'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AssignAdvisor;