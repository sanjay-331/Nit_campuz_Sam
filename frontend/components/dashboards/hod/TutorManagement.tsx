import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
// FIX: Import the correct selectors and actions for the tutoring feature.
import { selectAllUsers, selectAllTutors, selectAllTutorApplications, approveTutorApplicationRequest } from '../../../store/slices/appSlice';
import { AppDispatch } from '../../../store';
import EmptyState from '../../shared/EmptyState';
import { User, Student } from '../../../types';

const TutorManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const allUsers = useSelector(selectAllUsers);
    const tutors = useSelector(selectAllTutors);
    const applications = useSelector(selectAllTutorApplications);
    
    const pendingApplications = applications.filter(app => app.status === 'pending');

    const handleApprove = (applicationId: string) => {
        dispatch(approveTutorApplicationRequest(applicationId));
    };

    const handleReject = (applicationId: string) => {
        // In a real app, this would dispatch a reject action. For now, we'll just log it.
        console.log(`Rejected application ${applicationId}`);
    };
    
    const getUserById = (id: string): User | undefined => allUsers.find(u => u.id === id);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Tutor Management</h1>
                <p className="text-gray-500">Oversee the peer tutoring program for your department.</p>
            </div>

            <Tabs defaultValue="applications">
                <TabsList>
                    <TabsTrigger value="applications">Pending Applications ({pendingApplications.length})</TabsTrigger>
                    <TabsTrigger value="tutors">Approved Tutors ({tutors.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="applications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tutor Applications</CardTitle>
                            <CardDescription>Review and approve students who wish to become peer tutors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {pendingApplications.length > 0 ? (
                             <div className="space-y-4">
                                {pendingApplications.map(app => {
                                    const student = getUserById(app.studentId) as Student | undefined;
                                    return (
                                        <div key={app.id} className="p-4 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="flex-1">
                                                <p className="font-semibold">{student?.name} (CGPA: {student?.cgpa.toFixed(2)})</p>
                                                <p className="text-sm text-gray-600 my-1">Wants to tutor: <span className="font-medium">{app.subjects.join(', ')}</span></p>
                                                <p className="text-xs text-gray-500 italic">"{app.statement}"</p>
                                            </div>
                                            <div className="flex gap-2 self-end sm:self-center">
                                                <Button size="sm" onClick={() => handleApprove(app.id)}>Approve</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>Reject</Button>
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>
                           ) : (
                             <EmptyState title="No Pending Applications" message="There are no new applications to review at this time." />
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="tutors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Tutors</CardTitle>
                            <CardDescription>A list of all approved tutors in the system.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tutor Name</TableHead>
                                        <TableHead>Subjects</TableHead>
                                        <TableHead>Rating</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tutors.map(tutor => {
                                        const student = getUserById(tutor.studentId);
                                        return (
                                            <TableRow key={tutor.id}>
                                                <TableCell className="font-medium">{student?.name}</TableCell>
                                                <TableCell>{tutor.subjects.join(', ')}</TableCell>
                                                <TableCell>{tutor.rating.toFixed(1)} ★</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TutorManagement;
