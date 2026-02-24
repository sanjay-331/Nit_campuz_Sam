

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { UserRole, Department, User, Staff, StudentStatus, Permission, Student, Alumnus } from '../../../types';
import { PlusIcon } from '../../icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { selectAllDepartments, selectAllUsers, addDepartmentRequest, assignHODRequest } from '../../../store/slices/appSlice';

const DepartmentGrid: React.FC<{ departments: Department[], users: User[], onSelect: (dept: Department) => void }> = ({ departments, users, onSelect }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
            const hod = users.find(u => u.role === UserRole.HOD && u.departmentId === dept.id);
            const studentCount = users.filter(s => s.departmentId === dept.id && s.role === UserRole.STUDENT).length;
            const staffCount = users.filter(s => s.departmentId === dept.id && (s.role === UserRole.STAFF || s.role === UserRole.HOD)).length;
            return (
                <motion.div key={dept.id} onClick={() => onSelect(dept)} whileHover={{ y: -5 }} className="cursor-pointer">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{dept.name}</CardTitle>
                            <p className="text-sm text-gray-500">HOD: {hod?.name || 'Not Assigned'}</p>
                        </CardHeader>
                        <CardContent className="flex justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold">{studentCount}</p>
                                <p className="text-xs text-gray-500">Students</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{staffCount}</p>
                                <p className="text-xs text-gray-500">Staff</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )
        })}
    </div>
);

const DepartmentDetail: React.FC<{ department: Department, users: User[], onBack: () => void, onAssignHOD: (dept: Department) => void }> = ({ department, users, onBack, onAssignHOD }) => {
    const studentsInDept = users.filter(s => s.departmentId === department.id && s.role === UserRole.STUDENT) as Student[];
    const years = [...new Set(studentsInDept.map(s => s.year))].sort();

    return (
        <div>
            <div className="mb-6">
                <button onClick={onBack} className="text-sm font-medium text-gray-500 hover:text-blue-500 mb-1">&larr; Back to Departments</button>
                <h2 className="text-2xl font-bold">{department.name} Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {department.name === 'Science & Humanities' ? (
                         <Card>
                            <CardHeader><CardTitle>Department Users</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {studentsInDept.map(student => <li key={student.id} className="text-sm">{student.name}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    ) : (
                        years.map(year => {
                            const studentsInYear = studentsInDept.filter(s => s.year === year);
                            return (
                                <Card key={year}>
                                    <CardHeader><CardTitle>{year}{year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year Students</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 responsive-columns">
                                            {studentsInYear.map(student => <li key={student.id} className="text-sm break-inside-avoid">{student.name}</li>)}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Management</CardTitle></CardHeader>
                        <CardContent className="flex flex-col space-y-3">
                            <Button onClick={() => onAssignHOD(department)} variant="ghost" className="!justify-start">Assign/Change HOD</Button>
                            <Button variant="ghost" className="!justify-start">Add/Remove Classes</Button>
                            <Button variant="ghost" className="!justify-start text-orange-600 hover:bg-orange-50">Archive Department</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const CreateDepartmentModal: React.FC<{ onClose: () => void, onCreate: (name: string) => void }> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            onCreate(name.trim());
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Create New Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Department Name" required />
                    </CardContent>
                    <div className="p-4 flex justify-end space-x-2 bg-gray-50 rounded-b-2xl">
                        <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const AssignHODModal: React.FC<{ 
    department: Department, 
    users: User[], 
    onClose: () => void, 
    onAssign: (data: { deptId: string; staffId: string } | { deptId: string; newUser: { name: string; email: string; contact?: string } }) => void 
}> = ({ department, users, onClose, onAssign }) => {
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newContact, setNewContact] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    
    const availableStaff = users.filter(u => u.role === UserRole.STAFF && u.departmentId === department.id) as Staff[];
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (isManualEntry) {
            if (!newName.trim() || !newEmail.trim()) {
                setValidationError('Name and Email are required.');
                return;
            }
            onAssign({ deptId: department.id, newUser: { name: newName, email: newEmail, contact: newContact } });
        } else {
            if (!selectedStaffId) {
                setValidationError('Please select a staff member.');
                return;
            }
            onAssign({ deptId: department.id, staffId: selectedStaffId });
        }
    };

    return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Assign HOD for {department.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isManualEntry ? (
                            <div className="space-y-3">
                                <Input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Full Name"
                                />
                                <Input
                                    type="email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    placeholder="Email Address"
                                />
                                <Input
                                    type="text"
                                    value={newContact}
                                    onChange={e => setNewContact(e.target.value)}
                                    placeholder="Contact (Optional)"
                                />
                                <button type="button" onClick={() => setIsManualEntry(false)} className="text-sm text-blue-600 hover:underline mt-2">
                                    &larr; Select from existing staff
                                </button>
                            </div>
                        ) : (
                            <div>
                                <Select
                                    value={selectedStaffId}
                                    onValueChange={(value) => {
                                        setSelectedStaffId(value);
                                        if (value) setValidationError(null);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a Staff Member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStaff.length > 0 ? (
                                            availableStaff.map(staff => (
                                                <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-3 py-1.5 text-sm text-gray-500">No available staff.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <div className="text-center my-3 text-sm text-gray-500">or</div>
                                <Button
                                    type="button"
                                    onClick={() => setIsManualEntry(true)}
                                    variant="secondary"
                                    className="w-full"
                                    leftIcon={<PlusIcon className="w-4 h-4" />}
                                >
                                    Enter Manually
                                </Button>
                            </div>
                        )}
                        {validationError && <p className="text-sm text-red-500 mt-3">{validationError}</p>}
                    </CardContent>
                    <div className="p-4 flex justify-end space-x-2 bg-gray-50 rounded-b-2xl">
                        <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                        <Button type="submit">Assign HOD</Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}


const DepartmentManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const departments = useSelector(selectAllDepartments);
    const users = useSelector(selectAllUsers);

    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isAssignHODModalOpen, setAssignHODModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

    useEffect(() => {
        const isModalOpen = isCreateModalOpen || isAssignHODModalOpen;
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCreateModalOpen, isAssignHODModalOpen]);

    const handleCreateDepartment = (name: string) => {
        dispatch(addDepartmentRequest(name));
        setCreateModalOpen(false);
    };
    
    const handleOpenAssignHODModal = (dept: Department) => {
        setEditingDepartment(dept);
        setAssignHODModalOpen(true);
    };

    const handleAssignHOD = (data: { deptId: string; staffId: string } | { deptId: string; newUser: { name: string; email: string; contact?: string; } }) => {
        dispatch(assignHODRequest(data));
        setAssignHODModalOpen(false);
        setEditingDepartment(null);
    };

    return (
        <div className="space-y-6">
            {!selectedDepartment && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Department Management</h1>
                        <p className="text-slate-600">Organize and manage institutional departments.</p>
                    </div>
                     <Button onClick={() => setCreateModalOpen(true)} size="sm" leftIcon={<PlusIcon className="w-4 h-4" />}>
                        Create Department
                    </Button>
                </div>
            )}
             <AnimatePresence mode="wait">
                <motion.div
                    key={selectedDepartment ? selectedDepartment.id : 'grid'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {selectedDepartment ? (
                        <DepartmentDetail department={selectedDepartment} users={users} onBack={() => setSelectedDepartment(null)} onAssignHOD={handleOpenAssignHODModal} />
                    ) : (
                        <DepartmentGrid departments={departments} users={users} onSelect={setSelectedDepartment} />
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {isCreateModalOpen && <CreateDepartmentModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreateDepartment} />}
                {isAssignHODModalOpen && editingDepartment && (
                    <AssignHODModal 
                        department={editingDepartment} 
                        users={users}
                        onClose={() => setAssignHODModalOpen(false)}
                        onAssign={handleAssignHOD}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DepartmentManagement;