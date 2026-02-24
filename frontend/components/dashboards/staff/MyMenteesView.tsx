import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllMentorAssignments, selectAllUsers, selectAllRemarks, addRemarkRequest } from '../../../store/slices/appSlice';
import { Student } from '../../../types';
import EmptyState from '../../shared/EmptyState';
import Button from '../../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/Dialog';
import { AppDispatch } from '../../../store';

const MyMenteesView: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const allUsers = useSelector(selectAllUsers);
    const mentorAssignments = useSelector(selectAllMentorAssignments);
    const allRemarks = useSelector(selectAllRemarks);
    
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    const [newRemark, setNewRemark] = useState('');

    const myMentees = useMemo(() => {
        if (!user) return [];
        return mentorAssignments
            .filter(m => m.mentorId === user.id)
            .map(m => allUsers.find(u => u.id === m.studentId) as Student)
            .filter(Boolean);
    }, [user, mentorAssignments, allUsers]);
    
    const studentRemarks = useMemo(() => {
        if (!viewingStudent || !user) return [];
        return allRemarks.filter(r => r.studentId === viewingStudent.id && r.mentorId === user.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [viewingStudent, user, allRemarks]);

    const handleAddRemark = () => {
        if (!newRemark.trim() || !viewingStudent || !user) return;
        dispatch(addRemarkRequest({
            studentId: viewingStudent.id,
            mentorId: user.id,
            text: newRemark,
        }));
        setNewRemark('');
    };
    
    const getAttendancePercentage = (studentId: string) => {
        // Mocked for now
        return 90 + (studentId.charCodeAt(0) % 10);
    };

    return (
        <div className="space-y-6">
            <Dialog open={!!viewingStudent} onOpenChange={() => setViewingStudent(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Remarks for {viewingStudent?.name}</DialogTitle>
                        <DialogDescription>Add and view private feedback for your mentee.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                        <textarea
                            placeholder="Add a new remark..."
                            rows={3}
                            value={newRemark}
                            onChange={(e) => setNewRemark(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                         <div className="flex justify-end">
                            <Button size="sm" onClick={handleAddRemark} disabled={!newRemark.trim()}>Add Remark</Button>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2">History</h4>
                            {studentRemarks.length > 0 ? (
                                <ul className="space-y-3">
                                    {studentRemarks.map(remark => (
                                        <li key={remark.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                                            <p className="text-gray-700">{remark.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(remark.timestamp).toLocaleString()}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-gray-500 py-4">No remarks added yet.</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setViewingStudent(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div>
                <h1 className="text-3xl font-bold">My Mentees</h1>
                <p className="text-gray-500">Monitor and support your assigned students.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Mentee List ({myMentees.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {myMentees.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>CGPA</TableHead>
                                        <TableHead>Attendance</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myMentees.map(student => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                <Link to={`/profile/${student.id}`} className="text-indigo-600 hover:underline">
                                                    {student.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{student.year}</TableCell>
                                            <TableCell>{student.cgpa.toFixed(2)}</TableCell>
                                            <TableCell>{getAttendancePercentage(student.id)}%</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="secondary" onClick={() => setViewingStudent(student)}>
                                                    View/Add Remarks
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState title="No Mentees Assigned" message="You have not been assigned any mentees yet." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyMenteesView;
