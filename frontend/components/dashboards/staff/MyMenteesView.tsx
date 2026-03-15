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
import { motion, AnimatePresence } from 'framer-motion';

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
            .map(m => {
                if (m.student) return m.student;
                return allUsers.find(u => u.id === m.studentId) as Student;
            })
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
    
    const getAttendancePercentage = (student: Student) => {
        if (student.totalWorkingDays && student.totalWorkingDays > 0) {
            return ((student.daysPresent || 0) / student.totalWorkingDays * 100).toFixed(1);
        }
        return (90 + (student.id.charCodeAt(0) % 10)).toFixed(1);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <Dialog open={!!viewingStudent} onOpenChange={() => setViewingStudent(null)}>
                <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/90">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Remarks for {viewingStudent?.name}
                        </DialogTitle>
                        <DialogDescription>Add and view private feedback for your mentee.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                        <textarea
                            placeholder="Add a new remark..."
                            rows={3}
                            value={newRemark}
                            onChange={(e) => setNewRemark(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        />
                         <div className="flex justify-end">
                            <Button 
                                size="sm" 
                                onClick={handleAddRemark} 
                                disabled={!newRemark.trim()}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                Add Remark
                            </Button>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-2"></span>
                                Feedback History
                            </h4>
                            <AnimatePresence mode="popLayout">
                                {studentRemarks.length > 0 ? (
                                    <div className="space-y-3">
                                        {studentRemarks.map((remark, idx) => (
                                            <motion.div 
                                                key={remark.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group"
                                            >
                                                <p className="text-gray-700 leading-relaxed">{remark.text}</p>
                                                <p className="text-xs text-gray-400 mt-2 flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(remark.timestamp).toLocaleString()}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-center text-gray-500 py-8 bg-gray-200/20 rounded-xl border-dashed border-2">
                                        No remarks added yet. Start supporting your mentee!
                                    </p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setViewingStudent(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Mentees</h1>
                    <p className="text-lg text-gray-500 mt-1">Nurture and guide your assigned students through their academic journey.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Total Mentees</span>
                        <span className="text-2xl font-bold text-blue-900">{myMentees.length}</span>
                    </div>
                </div>
            </div>
            
            <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-xl">Mentee Directory</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {myMentees.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-100/50">
                                    <TableRow>
                                        <TableHead className="font-bold">Student Details</TableHead>
                                        <TableHead className="font-bold">Year</TableHead>
                                        <TableHead className="font-bold">Performance</TableHead>
                                        <TableHead className="font-bold">Attendance</TableHead>
                                        <TableHead className="text-right font-bold pr-8">Support</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="wait">
                                        {myMentees.map((student, idx) => (
                                            <motion.tr 
                                                key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-blue-50/30 transition-colors"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <Link to={`/profile/${student.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                                {student.name}
                                                            </Link>
                                                            <p className="text-xs text-gray-500">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase">
                                                        Year {student.year}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-bold ${student.cgpa >= 8 ? 'text-green-600' : student.cgpa >= 6 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                            {student.cgpa.toFixed(2)}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-semibold uppercase">CGPA</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 min-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-1000 ${parseFloat(getAttendancePercentage(student)) >= 85 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                                style={{ width: `${getAttendancePercentage(student)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700">{getAttendancePercentage(student)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        onClick={() => setViewingStudent(student)}
                                                        className="rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        Mentor Actions
                                                    </Button>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-12">
                            <EmptyState 
                                title="No Mentees Assigned" 
                                message="Your supportive presence makes a difference. As soon as students are assigned, they'll appear here." 
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default MyMenteesView;
