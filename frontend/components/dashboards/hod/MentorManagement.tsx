import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import Button from '../../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllUsers, selectAllMentorAssignments, autoAssignMenteesRequest, updateMentorAssignmentRequest, fetchMentorAssignmentsRequest, bulkUpdateMentorAssignmentsRequest } from '../../../store/slices/appSlice';
import { User, Student, Staff, UserRole } from '../../../types';
import EmptyState from '../../shared/EmptyState';
import { RocketIcon, WarningIcon } from '../../icons/Icons';

const MentorManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const allUsers = useSelector(selectAllUsers);
    const mentorAssignments = useSelector(selectAllMentorAssignments);

    React.useEffect(() => {
        dispatch(fetchMentorAssignmentsRequest());
    }, [dispatch]);

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

    const unassignedStudents = useMemo(() => {
        const assignedIds = new Set(mentorAssignments.map(a => a.studentId));
        return deptStudents.filter(s => !assignedIds.has(s.id));
    }, [deptStudents, mentorAssignments]);

    const unassignedByYear = useMemo(() => {
        const groups: { [key: number]: Student[] } = {};
        unassignedStudents.forEach(s => {
            if (!groups[s.year]) groups[s.year] = [];
            groups[s.year].push(s);
        });
        return groups;
    }, [unassignedStudents]);

    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudentIds(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const toggleYearSelection = (year: number, students: Student[]) => {
        const yearIds = students.map(s => s.id);
        const allSelected = yearIds.every(id => selectedStudentIds.includes(id));
        
        if (allSelected) {
            setSelectedStudentIds(prev => prev.filter(id => !yearIds.includes(id)));
        } else {
            setSelectedStudentIds(prev => Array.from(new Set([...prev, ...yearIds])));
        }
    };

    const handleAutoAssign = () => {
        if (!departmentId) return;
        dispatch(autoAssignMenteesRequest({ departmentId }));
        setConfirmModalOpen(false);
    };

    const handleOpenAssignModal = (student: Student) => {
        setNewMentorId('');
        setEditingStudent(student);
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

    const handleBulkAssign = () => {
        if (selectedStudentIds.length === 0 || !newMentorId) return;
        dispatch(bulkUpdateMentorAssignmentsRequest({ studentIds: selectedStudentIds, newMentorId }));
        setBulkModalOpen(false);
        setSelectedStudentIds([]);
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
                        <DialogTitle>{mentorAssignments.some(m => m.studentId === editingStudent?.id) ? 'Re-assign Mentor' : 'Assign Mentor'} for {editingStudent?.name}</DialogTitle>
                        <DialogDescription>Select a mentor from the list below.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        <Select value={newMentorId} onValueChange={setNewMentorId}>
                            <SelectTrigger><SelectValue placeholder="Select a mentor..." /></SelectTrigger>
                            <SelectContent>
                                {deptFaculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setEditingStudent(null)}>Cancel</Button>
                        <Button onClick={handleReassign} disabled={!newMentorId}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkModalOpen} onOpenChange={setBulkModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Mentor to {selectedStudentIds.length} Students</DialogTitle>
                        <DialogDescription>Choose a faculty member to mentor these students.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        <Select value={newMentorId} onValueChange={setNewMentorId}>
                            <SelectTrigger><SelectValue placeholder="Select a mentor..." /></SelectTrigger>
                            <SelectContent>
                                {deptFaculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setBulkModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkAssign} disabled={!newMentorId}>Confirm Bulk Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mentor Management</h1>
                    <p className="text-slate-500 font-medium">Assign and manage mentors for students in your department.</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedStudentIds.length > 0 && (
                        <Button onClick={() => setBulkModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                            Assign {selectedStudentIds.length} Selected
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setConfirmModalOpen(true)} leftIcon={<RocketIcon className="w-4 h-4" />}>
                        Auto-Assign All
                    </Button>
                </div>
            </div>

            {unassignedStudents.length > 0 && (
                <Card className="border-indigo-100 bg-indigo-50/10 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-indigo-800 flex items-center gap-2">
                                <WarningIcon className="w-5 h-5" />
                                Unassigned Students ({unassignedStudents.length})
                            </CardTitle>
                            <CardDescription>
                                Grouped by year. Select students for bulk assignment.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(Object.entries(unassignedByYear) as [string, Student[]][]).sort(([a], [b]) => Number(a) - Number(b)).map(([year, students]) => (
                            <details key={year} className="group border border-indigo-100/50 rounded-xl bg-white overflow-hidden shadow-sm" open>
                                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-indigo-50/50 transition-colors list-none font-bold text-slate-700">
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={students.every(s => selectedStudentIds.includes(s.id))}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleYearSelection(Number(year), students);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span>Year {year} ({students.length} students)</span>
                                    </div>
                                    <div className="text-slate-400 group-open:rotate-180 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </summary>
                                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-slate-50">
                                    {students.map(student => (
                                        <div key={student.id} className={`flex justify-between items-center p-3 border rounded-lg transition-all ${selectedStudentIds.includes(student.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50/50'}`}>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onChange={() => toggleStudentSelection(student.id)}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-800">{student.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium tracking-tight truncate max-w-[120px]">{student.email}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => handleOpenAssignModal(student)} className="h-8 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100">Quick Assign</Button>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </CardContent>
                </Card>
            )}

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
                                    <details key={faculty.id} className="p-4 border rounded-xl bg-gray-50/50 group overflow-hidden transition-all duration-300 open:bg-white open:shadow-md">
                                        <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {faculty.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900">{faculty.name}</p>
                                                    <p className="text-xs text-slate-500">{mentees.length} Mentees assigned</p>
                                                </div>
                                            </div>
                                            <div className="text-slate-400 group-open:rotate-180 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </summary>
                                        <div className="mt-4 pl-12">
                                            {mentees.length > 0 ? (
                                                <div className="space-y-3">
                                                    {mentees.map(mentee => (
                                                        <div key={mentee.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-xs font-medium text-slate-600">
                                                                    {mentee.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-700">{mentee.name}</p>
                                                                    <p className="text-xs text-slate-500">Year {mentee.year}</p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="ghost" onClick={() => handleOpenReassignModal(mentee)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Change Mentor</Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-6 text-center border-2 border-dashed rounded-lg">
                                                    <p className="text-sm text-gray-500 italic">No mentees assigned to this faculty member yet.</p>
                                                </div>
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