import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import Button from '../../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllUsers, selectAllMentorAssignments, autoAssignMenteesRequest, updateMentorAssignmentRequest } from '../../../store/slices/appSlice';
import { User, Student, Staff, UserRole } from '../../../types';
import EmptyState from '../../shared/EmptyState';
import { RocketIcon, WarningIcon } from '../../icons/Icons';

const MentorManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const allUsers = useSelector(selectAllUsers);
    const mentorAssignments = useSelector(selectAllMentorAssignments);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [newMentorId, setNewMentorId] = useState('');
    
    const departmentId = user?.departmentId;

    const deptFaculty = useMemo(() => {
        return allUsers.filter(u => u.departmentId === departmentId && (u.role === UserRole.STAFF || u.role === UserRole.HOD)) as Staff[];
    }, [allUsers, departmentId]);
    
    const deptStudents = useMemo(() => {
        return allUsers.filter(u => u.departmentId === departmentId && u.role === UserRole.STUDENT) as Student[];
    }, [allUsers, departmentId]);

    const handleAutoAssign = () => {
        if (!departmentId) return;
        dispatch(autoAssignMenteesRequest({ departmentId }));
        setConfirmModalOpen(false);
    };

    const handleOpenReassignModal = (student: Student) => {
        const currentAssignment = mentorAssignments.find(m => m.studentId === student.id);
        setNewMentorId(currentAssignment?.mentorId || '');
        setEditingStudent(student);
    };

    const handleReassign = () => {
        if (!editingStudent || !newMentorId) return;
        dispatch(updateMentorAssignmentRequest({ studentId: editingStudent.id, newMentorId }));
        setEditingStudent(null);
        setNewMentorId('');
    };
    
    return (
        <div className="space-y-6">
             <Dialog open={isConfirmModalOpen} onOpenChange={setConfirmModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><WarningIcon className="w-6 h-6 text-yellow-500" /> Confirm Auto-Assignment</DialogTitle>
                        <DialogDescription>This will override all existing manual mentor assignments for your department and distribute students evenly. This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAutoAssign}>Yes, Proceed</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
             <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Re-assign Mentor for {editingStudent?.name}</DialogTitle>
                        <DialogDescription>Select a new mentor from the list below.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        <Select value={newMentorId} onValueChange={setNewMentorId}>
                            <SelectTrigger><SelectValue placeholder="Select a new mentor..." /></SelectTrigger>
                            <SelectContent>
                                {deptFaculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setEditingStudent(null)}>Cancel</Button>
                        <Button onClick={handleReassign} disabled={!newMentorId}>Save Change</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mentor Management</h1>
                    <p className="text-slate-600">Assign and manage mentors for students in your department.</p>
                </div>
                <Button onClick={() => setConfirmModalOpen(true)} leftIcon={<RocketIcon className="w-4 h-4" />}>
                    Auto-Assign Mentees
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Faculty Mentor Assignments</CardTitle>
                    <CardDescription>
                        There are {deptStudents.length} students and {deptFaculty.length} faculty in this department.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {deptFaculty.length > 0 ? (
                        <div className="space-y-4">
                            {deptFaculty.map(faculty => {
                                const mentees = mentorAssignments.filter(m => m.mentorId === faculty.id)
                                    .map(m => allUsers.find(u => u.id === m.studentId) as Student)
                                    .filter(Boolean);

                                return (
                                    <details key={faculty.id} className="p-4 border rounded-xl bg-gray-50/50">
                                        <summary className="font-semibold cursor-pointer">
                                            {faculty.name} ({mentees.length} Mentees)
                                        </summary>
                                        <div className="mt-4 pl-4 border-l-2">
                                            {mentees.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {mentees.map(mentee => (
                                                        <li key={mentee.id} className="flex justify-between items-center text-sm">
                                                            <span>{mentee.name} - Year {mentee.year}</span>
                                                            <Button size="sm" variant="ghost" onClick={() => handleOpenReassignModal(mentee)}>Re-assign</Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500">No mentees assigned.</p>
                                            )}
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState title="No Faculty Found" message="Add staff to this department to assign them as mentors." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MentorManagement;