

import React, { useState, useMemo, useEffect, ChangeEvent, DragEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';

import { AppDispatch } from '../../../store';
import { bulkAssignTopicsRequest, selectAllUsers } from '../../../store/slices/appSlice';
import { Student, UserRole, StudentStatus, Course } from '../../../types';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { CheckCircleIcon, XIcon, UploadIcon } from '../../icons/Icons';

interface AssignmentData {
    studentId: string;
    studentName: string;
    topic: string;
    remarks: string;
}

interface BulkAssignTopicsTabProps {
  selectedCourse: string;
  myCourses: Course[];
  onBulkAssignSuccess: () => void;
}

const BulkAssignTopicsTab: React.FC<BulkAssignTopicsTabProps> = ({ selectedCourse, myCourses, onBulkAssignSuccess }) => {
    const dispatch = useDispatch<AppDispatch>();
    const users = useSelector(selectAllUsers);
    const STUDENTS = useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);

    const [assignments, setAssignments] = useState<AssignmentData[]>([]);
    const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const studentsInCourse = useMemo(() => {
        if (!selectedCourse) return [];
        const course = myCourses.find(c => c.id === selectedCourse);
        if (!course) return [];
        const targetYear = Math.floor((course.semester + 1) / 2);
        return STUDENTS.filter(s => s.departmentId === course.departmentId && (s as Student).year === targetYear);
    }, [selectedCourse, myCourses, STUDENTS]);

    useEffect(() => {
        const initialAssignments = studentsInCourse.map(student => ({
            studentId: student.id,
            studentName: student.name,
            topic: '',
            remarks: '',
        }));
        setAssignments(initialAssignments);
    }, [studentsInCourse]);

    const handleFileParse = (csvData: string) => {
        try {
            const rows = csvData.split('\n').slice(1); // Assuming header row
            const csvMap = new Map<string, { topic: string, remarks?: string }>();
            rows.forEach(row => {
                const [studentName, topic, remarks] = row.split(',').map(s => s.trim().replace(/"/g, ''));
                if (studentName && topic) {
                    csvMap.set(studentName.toLowerCase(), { topic, remarks: remarks || '' });
                }
            });

            const newAssignments = studentsInCourse.map(student => {
                const csvEntry = csvMap.get(student.name.toLowerCase());
                return {
                    studentId: student.id,
                    studentName: student.name,
                    topic: csvEntry?.topic || '',
                    remarks: csvEntry?.remarks || '',
                };
            });
            setAssignments(newAssignments);
            setToast({ title: 'CSV Loaded', message: 'Topics have been populated from the file.' });
        } catch (error) {
            setToast({ title: 'Error', message: 'Failed to parse CSV file.' });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };
    
    const handleFileChange = (files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                handleFileParse(text);
            };
            reader.readAsText(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };
    
    const handleTopicChange = (studentId: string, topic: string) => {
        setAssignments(prev => prev.map(a => a.studentId === studentId ? { ...a, topic } : a));
    };
    
    const handleRemarksChange = (studentId: string, remarks: string) => {
        setAssignments(prev => prev.map(a => a.studentId === studentId ? { ...a, remarks } : a));
    };

    const handleSaveChanges = async () => {
        if (!selectedCourse) return;
        setIsLoading(true);
        const validAssignments = assignments
            .filter(a => a.topic.trim() !== '')
            .map(({ studentId, topic, remarks }) => ({ studentId, topic, remarks }));
        
        // Simulating async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch(bulkAssignTopicsRequest({ courseId: selectedCourse, assignments: validAssignments }));
        
        setIsLoading(false);
        onBulkAssignSuccess();
    };

    return (
         <div className="space-y-6">
            <AnimatePresence>
                {toast && (
                     <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="fixed bottom-24 right-6 z-50 w-full max-w-sm p-4 bg-slate-800 text-white rounded-2xl shadow-lg flex items-center"
                    >
                        <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3" />
                        <div>
                            <p className="font-semibold">{toast.title}</p>
                            <p className="text-sm text-slate-300">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="ml-auto p-1 rounded-full hover:bg-slate-700">
                           <XIcon className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card>
                <CardHeader>
                    <CardTitle>Topic Assignment</CardTitle>
                    <CardDescription>Upload a CSV with (Student Name,Topic,Remarks) or manually enter topics for each student. The remarks column is optional.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mb-6 p-6 border-2 border-dashed rounded-xl text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}
                    >
                        <UploadIcon className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="mt-2 text-sm text-slate-500">
                           Drag & drop a CSV file here, or
                        </p>
                        <div className="mt-4">
                            <input type="file" id="csv-upload" className="sr-only" accept=".csv" onChange={(e) => handleFileChange(e.target.files)} />
                            <label htmlFor="csv-upload" className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500">
                                click to upload
                            </label>
                        </div>
                    </div>
                
                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-6 gap-4 pb-2 border-b">
                            <label className="font-semibold text-sm md:col-span-2">Student Name</label>
                            <label className="font-semibold text-sm md:col-span-2">Assigned Topic</label>
                            <label className="font-semibold text-sm md:col-span-2">Remarks (Optional)</label>
                        </div>
                        {assignments.map(({ studentId, studentName, topic, remarks }) => (
                            <div key={studentId} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                <label className="font-medium text-sm md:col-span-2">{studentName}</label>
                                <Input
                                    placeholder="Enter topic..."
                                    value={topic}
                                    onChange={(e) => handleTopicChange(studentId, e.target.value)}
                                    className="md:col-span-2"
                                />
                                <Input
                                    placeholder="Enter remarks..."
                                    value={remarks}
                                    onChange={(e) => handleRemarksChange(studentId, e.target.value)}
                                    className="md:col-span-2"
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end items-center gap-4">
                <Button onClick={handleSaveChanges} loading={isLoading}>
                    Save All Assignments
                </Button>
            </div>
        </div>
    );
};

export default BulkAssignTopicsTab;
