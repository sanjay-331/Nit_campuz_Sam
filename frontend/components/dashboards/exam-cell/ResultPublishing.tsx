import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { UploadIcon } from '../../icons/Icons';
import { selectAllCourses, selectAllUsers } from '../../../store/slices/appSlice';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../../store/slices/uiSlice';
import { UserRole } from '../../../types';

const ResultPublishing: React.FC = () => {
    const dispatch = useDispatch();
    const COURSES = useSelector(selectAllCourses);
    const users = useSelector(selectAllUsers);
    const STAFF = React.useMemo(() => users.filter(u => u.role === UserRole.STAFF), [users]);

    const mockInternalMarks = React.useMemo(() => COURSES.slice(0, 3).map(course => ({
        courseId: course.id,
        courseName: `${course.name} (${course.code})`,
        staffName: STAFF.find(s => s.id === course.staffId)?.name || 'Unknown',
        status: Math.random() > 0.3 ? 'Verified' : 'Pending'
    })), [COURSES, STAFF]);

    const handlePublish = () => {
        dispatch(showToast({ type: 'success', title: 'Results Published!', message: 'Students have been notified.' }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Result Publishing</h1>
                <p className="text-gray-500">Follow the steps to upload, verify, and publish semester results.</p>
            </div>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">1. Upload</TabsTrigger>
                    <TabsTrigger value="verify">2. Verify</TabsTrigger>
                    <TabsTrigger value="publish">3. Publish</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                    <Card>
                        <CardHeader><CardTitle>Upload Final Marks</CardTitle></CardHeader>
                        <CardContent className="text-center">
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12">
                                <UploadIcon className="w-12 h-12 mx-auto text-gray-300" />
                                <p className="mt-2 text-sm text-gray-500">Drag & drop your CSV/Excel file here or click to browse.</p>
                                <Button className="mt-4">Upload File</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="verify">
                    <Card>
                        <CardHeader><CardTitle>Verify Internal Marks</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Staff</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockInternalMarks.map(item => (
                                            <TableRow key={item.courseId}>
                                                <TableCell className="font-medium">{item.courseName}</TableCell>
                                                <TableCell>{item.staffName}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {item.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="secondary" disabled={item.status === 'Verified'}>
                                                        {item.status === 'Verified' ? 'Verified' : 'Verify'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="publish">
                    <Card>
                        <CardHeader><CardTitle>Generate & Publish Final Results</CardTitle></CardHeader>
                        <CardContent className="text-center">
                             <div className="p-8 bg-gray-50 rounded-xl">
                                <p className="text-gray-600">You are about to publish the final results for Semester 3 & 5.</p>
                                <p className="text-sm text-gray-500 mt-1">This will calculate final GPA/CGPA and make results visible to all students.</p>
                                <Button className="mt-6" size="lg" onClick={handlePublish}>
                                    Publish Results Now
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ResultPublishing;
