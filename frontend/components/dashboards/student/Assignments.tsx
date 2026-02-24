import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { Card, CardContent } from '../../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { selectAllAssignments, selectAllCourses } from '../../../store/slices/appSlice';
import Button from '../../ui/Button';
import EmptyState from '../../shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { UploadIcon } from '../../icons/Icons';
import { AppDispatch } from '../../../store';
import { submitAssignmentRequest, selectAllSubmissions } from '../../../store/slices/appSlice';
import { Assignment, StudentSubmission } from '../../../types';

const Assignments: React.FC = () => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch<AppDispatch>();
    const submissions = useSelector(selectAllSubmissions);
    const ASSIGNMENTS = useSelector(selectAllAssignments);
    const COURSES = useSelector(selectAllCourses);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');

    const myAssignments = useMemo(() => {
        if (!user) return [];
        const studentCourses = COURSES.filter(c => c.departmentId === user.departmentId);
        return ASSIGNMENTS.filter(a => studentCourses.some(c => c.id === a.courseId));
    }, [user]);

    const getStudentSubmission = (assignmentId: string): StudentSubmission | undefined => {
        return submissions.find(s => s.assignmentId === assignmentId && s.studentId === user?.id);
    }

    const pendingAssignments = myAssignments.filter(a => !getStudentSubmission(a.id));
    const submittedAssignments = myAssignments.filter(a => !!getStudentSubmission(a.id));

    const handleOpenModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFile(null);
        setText('');
        setIsModalOpen(true);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment || !user) return;
        
        dispatch(submitAssignmentRequest({
            assignmentId: selectedAssignment.id,
            studentId: user.id,
            fileUrl: file ? `/submissions/${user.id}_${file.name}` : undefined,
            textSubmission: text || undefined,
        }));
        
        setIsModalOpen(false);
    };

    const AssignmentList: React.FC<{ assignments: Assignment[] }> = ({ assignments }) => (
        <ul className="space-y-4">
            {assignments.map(assignment => {
                const course = COURSES.find(c => c.id === assignment.courseId);
                const submission = getStudentSubmission(assignment.id);
                return (
                    <li key={assignment.id} className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">{assignment.title}</p>
                            <p className="text-sm text-gray-500">{course?.name} ({course?.code})</p>
                            <p className="text-xs text-gray-500 mt-1">Due: {assignment.dueDate}</p>
                        </div>
                        {!submission ? (
                            <Button size="sm" onClick={() => handleOpenModal(assignment)}>Submit</Button>
                        ) : (
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                submission.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                                submission.status === 'Graded' ? 'bg-blue-100 text-blue-800' : 
                                'bg-green-100 text-green-800'
                            }`}>
                                {submission.status === 'Graded' ? `Graded: ${submission.grade}` : submission.status}
                            </span>
                        )}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <div className="space-y-6">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Submit: {selectedAssignment?.title}</DialogTitle>
                            <DialogDescription>Upload your file or enter your submission text below.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                             <label
                                htmlFor="file-upload"
                                className="cursor-pointer block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-500 transition-colors"
                            >
                                <UploadIcon className="w-10 h-10 mx-auto text-gray-300" />
                                <p className="mt-2 text-sm text-gray-500 break-words">
                                    {file ? (
                                        <span className="font-medium text-blue-600">{file.name}</span>
                                    ) : (
                                        "Click to upload a file"
                                    )}
                                </p>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <textarea
                                placeholder="Or type your submission here..."
                                rows={4}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Submit Assignment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div>
                <h1 className="text-3xl font-bold">Assignments</h1>
                <p className="text-gray-500">Track and submit your course assignments.</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
                    <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    <Card>
                        <CardContent className="pt-6">
                            {pendingAssignments.length > 0 ? (
                                <AssignmentList assignments={pendingAssignments} />
                            ) : (
                                <EmptyState title="No Pending Assignments" message="You're all caught up!" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="submitted">
                     <Card>
                        <CardContent className="pt-6">
                            {submittedAssignments.length > 0 ? (
                                <AssignmentList assignments={submittedAssignments} />
                            ) : (
                                <EmptyState title="No Submitted Assignments" message="Submit an assignment to see it here." />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Assignments;