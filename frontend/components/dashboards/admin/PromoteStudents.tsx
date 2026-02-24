import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { AppDispatch } from '../../../store';
import { selectAllUsers, selectAllDepartments, transferStudentsRequest, promoteClassRequest } from '../../../store/slices/appSlice';
import { Student, UserRole, Department, StudentStatus } from '../../../types';
import EmptyState from '../../shared/EmptyState';
import Button from '../../ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/Dialog';
import { WarningIcon } from '../../icons/Icons';

const PromoteStudents: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const allUsers = useSelector(selectAllUsers);
    const allDepartments = useSelector(selectAllDepartments);

    const [confirmAction, setConfirmAction] = useState<any>(null);

    // --- S&H Transfer Logic ---
    const shStudents = useMemo(() => {
        return allUsers.filter(u => 
            u.role === UserRole.STUDENT && 
            u.departmentId === 'd4' && // Science & Humanities ID
            (u as Student).year === 1
        ) as Student[];
    }, [allUsers]);

    const shSections = useMemo(() => {
        const sections: Record<string, { students: Student[], targetDepartmentId: string }> = {};
        shStudents.forEach(student => {
            if (!sections[student.section]) {
                sections[student.section] = { students: [], targetDepartmentId: '' };
            }
            sections[student.section].students.push(student);
        });
        return sections;
    }, [shStudents]);

    // FIX: Explicitly type the state to prevent inference issues with Object.entries.
    const [sectionTransferState, setSectionTransferState] = useState<Record<string, { students: Student[], targetDepartmentId: string }>>(shSections);

    const targetDepartments = useMemo(() => {
        return allDepartments.filter(d => d.id !== 'd4'); // Exclude S&H
    }, [allDepartments]);

    const handleTargetDeptChange = (section: string, departmentId: string) => {
        setSectionTransferState(prev => ({
            ...prev,
            [section]: { ...prev[section], targetDepartmentId: departmentId }
        }));
    };
    
    const handleTransfer = (section: string) => {
        const { students, targetDepartmentId } = sectionTransferState[section];
        if (students.length === 0 || !targetDepartmentId) return;
        
        dispatch(transferStudentsRequest({
            studentIds: students.map(s => s.id),
            newDepartmentId: targetDepartmentId,
        }));
        setConfirmAction(null);
    };

    // --- Yearly Promotion Logic ---
    const promotableClasses = useMemo(() => {
        const classes: Record<string, Student[]> = {};
        allUsers.forEach(user => {
            if (user.role === UserRole.STUDENT && user.departmentId !== 'd4' && user.status === StudentStatus.ACTIVE) {
                const student = user as Student;
                const key = `${student.departmentId}_${student.year}`;
                if (!classes[key]) {
                    classes[key] = [];
                }
                classes[key].push(student);
            }
        });
        return Object.entries(classes).map(([key, students]) => {
            const [departmentId, yearStr] = key.split('_');
            const year = parseInt(yearStr, 10);
            const department = allDepartments.find(d => d.id === departmentId);
            return {
                key,
                departmentName: department?.name || 'Unknown',
                departmentId,
                year,
                studentCount: students.length,
            };
        }).sort((a, b) => a.departmentName.localeCompare(b.departmentName) || a.year - b.year);
    }, [allUsers, allDepartments]);
    
    const handlePromote = (departmentId: string, year: number) => {
        dispatch(promoteClassRequest({ departmentId, year }));
        setConfirmAction(null);
    };

    return (
        <div className="space-y-8">
            <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><WarningIcon className="w-6 h-6 text-yellow-500" /> Confirm Action</DialogTitle>
                        <DialogDescription>{confirmAction?.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
                        <Button onClick={confirmAction?.action}>Yes, Proceed</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        
            <div>
                <h1 className="text-3xl font-bold">Class-wise Promotion</h1>
                <p className="text-gray-500">Promote entire classes or sections in bulk.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>First Year S&H Transfer</CardTitle>
                    <CardDescription>Transfer sections of first-year students to their new departments for the second year.</CardDescription>
                </CardHeader>
                <CardContent>
                    {Object.keys(shSections).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* FIX: Changed from Object.entries to Object.keys to fix typing issue with `data`. */}
                            {Object.keys(sectionTransferState).map((section) => {
                                const data = sectionTransferState[section];
                                return (
                                <div key={section} className="p-4 border rounded-xl bg-slate-50 space-y-3">
                                    <h3 className="font-bold">Section {section}</h3>
                                    <p className="text-sm text-slate-600">{data.students.length} students</p>
                                    <Select value={data.targetDepartmentId} onValueChange={(val) => handleTargetDeptChange(section, val)}>
                                        <SelectTrigger><SelectValue placeholder="Select Target Dept..." /></SelectTrigger>
                                        <SelectContent>{targetDepartments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Button size="sm" className="w-full" disabled={!data.targetDepartmentId} onClick={() => setConfirmAction({
                                        description: `Are you sure you want to transfer all ${data.students.length} students from Section ${section} to the ${targetDepartments.find(d => d.id === data.targetDepartmentId)?.name} department? This will also promote them to 2nd Year.`,
                                        action: () => handleTransfer(section)
                                    })}>
                                        Transfer Section {section}
                                    </Button>
                                </div>
                            )})}
                        </div>
                    ) : (
                        <EmptyState title="No S&H Students" message="There are currently no first-year students in the Science & Humanities department." />
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Yearly Class Promotion</CardTitle>
                    <CardDescription>Promote classes to the next year or graduate final year students.</CardDescription>
                </CardHeader>
                <CardContent>
                    {promotableClasses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {promotableClasses.map(cls => {
                                const isFinalYear = cls.year === 4;
                                const actionText = isFinalYear ? 'Graduate Class' : `Promote to ${cls.year + 1}rd Year`;
                                return (
                                <div key={cls.key} className="p-4 border rounded-xl bg-slate-50 space-y-3 flex flex-col">
                                    <div className="flex-grow">
                                        <h3 className="font-bold">{cls.departmentName}</h3>
                                        <p className="text-sm text-slate-600">{cls.year}{cls.year === 2 ? 'nd' : cls.year === 3 ? 'rd' : 'th'} Year - {cls.studentCount} students</p>
                                    </div>
                                    <Button size="sm" className="w-full" onClick={() => setConfirmAction({
                                        description: isFinalYear ? `Are you sure you want to graduate all ${cls.studentCount} students from ${cls.departmentName}? Their status will be changed to Alumni.` : `Are you sure you want to promote all ${cls.studentCount} students from ${cls.departmentName} ${cls.year}th Year to the next year?`,
                                        action: () => handlePromote(cls.departmentId, cls.year)
                                    })}>
                                        {actionText}
                                    </Button>
                                </div>
                            )})}
                        </div>
                    ) : (
                         <EmptyState title="No Classes to Promote" message="All classes are either first years in S&H or have already been promoted." />
                    )}
                </CardContent>
            </Card>

        </div>
    );
};

export default PromoteStudents;
