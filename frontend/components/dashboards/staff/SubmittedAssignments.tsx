
import React, { useState, useMemo, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllAssignments, addAssignmentRequest, selectAllSubmissions, gradeSubmissionRequest, selectAllCourses, selectAllUsers } from '../../../store/slices/appSlice';
import { Assignment, StudentSubmission, UserRole, StudentStatus, Student } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import EmptyState from '../../shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { PlusIcon, FileTextIcon } from '../../icons/Icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import BulkAssignTopicsTab from './BulkAssignTopicsTab';

// --- Main Assignments Component ---
const SubmittedAssignments: React.FC = () => {
    const user = useSelector(selectUser);
    const assignments = useSelector(selectAllAssignments);
    const submissions = useSelector(selectAllSubmissions);
    const COURSES = useSelector(selectAllCourses);
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);
    const dispatch = useDispatch<AppDispatch>();

    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: '', dueDate: '' });
    const [activeTab, setActiveTab] = useState('manage');
    
    const [viewingSubmission, setViewingSubmission] = useState<StudentSubmission | null>(null);
    const [grade, setGrade] = useState('');

    const myCourses = useMemo(() => COURSES.filter(c => c.staffId === user?.id), [user]);

    const assignmentsForCourse = useMemo(() => {
        if (!selectedCourse) return [];
        return assignments.filter(a => a.courseId === selectedCourse);
    }, [selectedCourse, assignments]);

    const studentsInCourse = useMemo(() => {
        if (!selectedCourse) return [];
        const course = myCourses.find(c => c.id === selectedCourse);
        if (!course) return [];
        // Match students by department and year derived from semester
        const targetYear = Math.floor((course.semester + 1) / 2);
        return STUDENTS.filter(s => s.departmentId === course.departmentId && s.year === targetYear);
    }, [selectedCourse, myCourses]);

    const getSubmissionStatus = (studentId: string, assignmentId: string) => {
        const submission = submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);

        if (submission && submission.grade) {
            return { text: 'Graded', color: 'bg-blue-100 text-blue-800' };
        }
        
        if (!submission || !submission.submittedAt) {
            return { text: 'Not Submitted', color: 'bg-gray-100 text-gray-800' };
        }

        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
            const submissionDate = new Date(submission.submittedAt);
            const dueDate = new Date(assignment.dueDate);
            dueDate.setHours(23, 59, 59, 999);

            if (submissionDate > dueDate) {
                return { text: 'Late', color: 'bg-yellow-100 text-yellow-800' };
            }
        }

        return { text: 'Submitted', color: 'bg-green-100 text-green-800' };
    };
    
    const handleAddAssignment = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedCourse || !newAssignment.title || !newAssignment.dueDate) return;
        
        dispatch(addAssignmentRequest({
            courseId: selectedCourse,
            title: newAssignment.title,
            dueDate: newAssignment.dueDate,
        }));
        
        setAddModalOpen(false);
        setNewAssignment({ title: '', dueDate: '' });
    };

    const handleViewSubmission = (studentId: string, assignmentId: string) => {
        const submission = submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (submission) {
            setViewingSubmission(submission);
            setGrade(submission.grade || '');
        }
    };
    
    const handleBulkAssignSuccess = () => {
        setActiveTab('manage');
    };

    const handleGrade = () => {
        if (!viewingSubmission) return;
        dispatch(gradeSubmissionRequest({
            studentId: viewingSubmission.studentId,
            assignmentId: viewingSubmission.assignmentId,
            grade,
        }));
        setViewingSubmission(null);
    };

    const studentForSubmission = useMemo(() => {
        if (!viewingSubmission) return null;
        return STUDENTS.find(s => s.id === viewingSubmission.studentId);
    }, [viewingSubmission]);

    return (
        <div className="space-y-6">
             <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent>
                    <form onSubmit={handleAddAssignment}>
                        <DialogHeader>
                            <DialogTitle>Add New Assignment</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <Input
                                placeholder="Assignment Title"
                                value={newAssignment.title}
                                onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                                required
                            />
                            <Input
                                type="date"
                                value={newAssignment.dueDate}
                                onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Add Assignment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Review Submission: {studentForSubmission?.name}</DialogTitle>
                        <DialogDescription>
                            Submitted at {viewingSubmission && viewingSubmission.submittedAt ? new Date(viewingSubmission.submittedAt).toLocaleString() : 'Not yet submitted'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-xl border">
                                <h4 className="font-semibold text-sm mb-2 text-slate-600 border-b pb-2">Assignment Context</h4>
                                <div className="space-y-3 pt-3">
                                    {viewingSubmission?.topic && (
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">Assigned Topic</p>
                                            <p className="font-semibold text-slate-800">{viewingSubmission.topic}</p>
                                        </div>
                                    )}
                                    {viewingSubmission?.remarks && (
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">Remarks / Instructions</p>
                                            <p className="text-sm text-slate-700 italic">"{viewingSubmission.remarks}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border">
                                <h4 className="font-semibold text-sm mb-2 text-slate-600 border-b pb-2">Grading</h4>
                                <div className="space-y-4 pt-3">
                                    {viewingSubmission?.grade && (
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">Current Grade</p>
                                            <p className="font-bold text-xl text-indigo-600">{viewingSubmission.grade}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="grade-input" className="text-xs font-medium text-slate-500">
                                            {viewingSubmission?.grade ? 'Update Grade' : 'Assign Grade'}
                                        </label>
                                        <Input
                                            id="grade-input"
                                            placeholder="e.g. A+, B, 85%" 
                                            value={grade}
                                            onChange={e => setGrade(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-slate-600">Student's Work</h4>
                            {viewingSubmission?.fileUrl && (
                                <div className="p-4 bg-white rounded-xl border">
                                    <h5 className="font-semibold text-xs mb-2 text-slate-500">Submitted File</h5>
                                    <div className="flex items-center gap-2 text-indigo-600">
                                        <FileTextIcon className="w-5 h-5" />
                                        <a href="#" className="font-medium underline break-all">{viewingSubmission.fileUrl.split('/').pop()}</a>
                                    </div>
                                </div>
                            )}
                            {viewingSubmission?.textSubmission && (
                                 <div className="p-4 bg-white rounded-xl border">
                                    <h5 className="font-semibold text-xs mb-2 text-slate-500">Text Submission</h5>
                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{viewingSubmission.textSubmission}</p>
                                </div>
                            )}
                            {(!viewingSubmission?.fileUrl && !viewingSubmission?.textSubmission) && (
                                <p className="text-sm text-slate-500">No file or text was submitted for this assignment.</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setViewingSubmission(null)}>Close</Button>
                        <Button type="button" onClick={handleGrade}>Save Grade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Assignments</h1>
                    <p className="text-gray-500">Manage assignments and review student submissions for your courses.</p>
                </div>
                <div className="w-full sm:w-64">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger><SelectValue placeholder="Select a course..." /></SelectTrigger>
                        <SelectContent>
                            {myCourses.map(course => <SelectItem key={course.id} value={course.id}>{course.name} ({course.code})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Assign Topics</TabsTrigger>
                </TabsList>

                <TabsContent value="manage" className="space-y-6 pt-6">
                    <div className="flex justify-end">
                         <Button onClick={() => setAddModalOpen(true)} disabled={!selectedCourse} leftIcon={<PlusIcon className="w-4 h-4" />}>
                            Add Assignment
                        </Button>
                    </div>
                    
                    {selectedCourse ? (
                        assignmentsForCourse.length > 0 ? (
                            <div className="space-y-6">
                                {assignmentsForCourse.map(assignment => (
                                    <Card key={assignment.id}>
                                        <CardHeader>
                                            <CardTitle>{assignment.title}</CardTitle>
                                            <p className="text-sm text-gray-500">Due: {assignment.dueDate}</p>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Student Name</TableHead>
                                                            <TableHead>Assigned Topic</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Action</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {studentsInCourse.map(student => {
                                                            const submission = submissions.find(s => s.studentId === student.id && s.assignmentId === assignment.id);
                                                            const status = getSubmissionStatus(student.id, assignment.id);
                                                            return (
                                                                <TableRow key={student.id}>
                                                                    <TableCell className="font-medium">
                                                                        <Link to={`/profile/${student.id}`} className="hover:opacity-80 transition-opacity">
                                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                                {student.name}
                                                                            </span>
                                                                        </Link>
                                                                    </TableCell>
                                                                    <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={submission?.topic}>
                                                                        {submission?.topic || '—'}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                                                            {status.text}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button size="sm" variant="secondary" disabled={!submission || (!submission.submittedAt && !submission.textSubmission)} onClick={() => handleViewSubmission(student.id, assignment.id)}>
                                                                            View Submission
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
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="No Assignments for this Course" message="Add an assignment to get started." />
                        )
                    ) : (
                        <EmptyState title="No Course Selected" message="Please select a course to view assignment submissions." />
                    )}
                </TabsContent>

                <TabsContent value="bulk" className="pt-6">
                    {selectedCourse ? (
                        <BulkAssignTopicsTab selectedCourse={selectedCourse} myCourses={myCourses} onBulkAssignSuccess={handleBulkAssignSuccess} />
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <EmptyState title="No Course Selected" message="Please select a course to bulk assign topics." />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SubmittedAssignments;