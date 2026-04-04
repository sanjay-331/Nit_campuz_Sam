import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { PlusIcon, UploadIcon, SearchIcon } from '../../icons/Icons';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { selectAllCourses, selectAllDepartments, selectAllUsers, addCourseRequest, bulkAddCoursesRequest } from '../../../store/slices/appSlice';
import { AppDispatch } from '../../../store';
import { Course, UserRole } from '../../../types';
import EmptyState from '../../shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const CourseManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const courses = useSelector(selectAllCourses);
    const departments = useSelector(selectAllDepartments);
    const users = useSelector(selectAllUsers);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    const staffMembers = useMemo(() => users.filter(u => u.role === UserRole.STAFF || u.role === UserRole.HOD), [users]);

    const filteredCourses = useMemo(() => {
        return courses.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = selectedDept === 'all' || c.departmentId === selectedDept;
            return matchesSearch && matchesDept;
        });
    }, [courses, searchTerm, selectedDept]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const newCourses = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const data: any = {};
                headers.forEach((h, i) => data[h] = values[i]);
                
                // Find department ID from name if necessary
                let deptId = data.departmentid || data.department;
                if (data.department) {
                    const dept = departments.find(d => d.name.toLowerCase() === data.department.toLowerCase());
                    if (dept) deptId = dept.id;
                }

                // Find staff ID from email
                let staffId = data.staffid || data.staff;
                if (data.staffemail) {
                    const staff = staffMembers.find(s => s.email.toLowerCase() === data.staffemail.toLowerCase());
                    if (staff) staffId = staff.id;
                }

                return {
                    name: data.name,
                    code: data.code,
                    credits: Number(data.credits),
                    semester: Number(data.semester),
                    departmentId: deptId,
                    staffId: staffId
                };
            }).filter(c => c.name && c.code && c.departmentId);

            if (newCourses.length > 0) {
                dispatch(bulkAddCoursesRequest(newCourses));
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit">Course Management</h1>
                    <p className="text-slate-500 font-medium">Define and assign courses for each department.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <label className="cursor-pointer">
                        <Input type="file" className="sr-only" accept=".csv" onChange={handleFileUpload} />
                        <Button variant="secondary" leftIcon={<UploadIcon className="w-4 h-4" />}>Import CSV</Button>
                    </label>
                    <Button onClick={() => setAddModalOpen(true)} leftIcon={<PlusIcon className="w-4 h-4" />}>Add Course</Button>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-md">
                <CardHeader className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100">
                    <div className="relative w-full sm:w-72">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search courses..." 
                            className="pl-10 bg-white border-slate-200" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                        <SelectTrigger className="w-full sm:w-60 bg-white border-slate-200">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Credits</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Instructor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCourses.map(course => {
                                    const dept = departments.find(d => d.id === course.departmentId);
                                    const staff = staffMembers.find(s => s.id === course.staffId);
                                    return (
                                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-indigo-600">{course.code}</td>
                                            <td className="px-6 py-4 text-slate-700 font-semibold">{course.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{dept?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-slate-600">Sem {course.semester}</td>
                                            <td className="px-6 py-4 text-slate-600">{course.credits}</td>
                                            <td className="px-6 py-4">
                                                {staff ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {staff.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not Assigned</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredCourses.length === 0 && (
                        <div className="py-12">
                            <EmptyState title="No Courses Found" message="Try searching for a different course code or name." />
                        </div>
                    )}
                </CardContent>
            </Card>

            <AnimatePresence>
                {isAddModalOpen && (
                    <AddCourseModal 
                        departments={departments} 
                        staffMembers={staffMembers}
                        onClose={() => setAddModalOpen(false)} 
                        onSave={(data) => {
                            dispatch(addCourseRequest(data));
                            setAddModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const AddCourseModal: React.FC<{ 
    departments: any[], 
    staffMembers: any[],
    onClose: () => void, 
    onSave: (data: any) => void 
}> = ({ departments, staffMembers, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', code: '', credits: 3, semester: 1, departmentId: '', staffId: ''
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900">Add New Course</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Course Code</label>
                            <Input placeholder="e.g. CS101" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Course Name</label>
                            <Input placeholder="e.g. Data Structures" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Credits</label>
                            <Input type="number" value={formData.credits} onChange={e => setFormData({...formData, credits: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Semester</label>
                            <Input type="number" value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Department</label>
                        <Select value={formData.departmentId} onValueChange={v => setFormData({...formData, departmentId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                            <SelectContent>
                                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Instructor (Optional)</label>
                        <Select value={formData.staffId} onValueChange={v => setFormData({...formData, staffId: v})}>
                            <SelectTrigger><SelectValue placeholder="Assign Instructor" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSave(formData)}>Create Course</Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CourseManagement;
