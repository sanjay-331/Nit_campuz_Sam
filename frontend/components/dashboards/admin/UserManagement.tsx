import React, { useState, useMemo, useEffect, DragEvent, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';

import { UploadIcon, UserAddIcon, DotsHorizontalIcon, PencilIcon, TrashIcon, ExclamationCircleIcon, WarningIcon, UserIcon, MailIcon } from '../../icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Department, User, UserRole, StudentStatus, Permission, Student } from '../../../types';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/DropdownMenu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Skeleton } from '../../ui/Skeleton';
import EmptyState from '../../shared/EmptyState';
import { selectCan } from '../../../store/slices/authSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { AppDispatch, RootState } from '../../../store';
import { Link } from 'react-router-dom';
import { selectAllUsers, addUserRequest, updateUserInListRequest, bulkUpdateUsersStatusRequest, bulkPromoteStudentsRequest, bulkAddUsersRequest } from '../../../store/slices/appSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { showToast } from '../../../store/slices/uiSlice';
import { selectAllDepartments } from '../../../store/slices/appSlice';

const UserManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const users = useSelector(selectAllUsers);
    const DEPARTMENTS = useSelector(selectAllDepartments);

    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ role: '', departmentId: '', q: '' });
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [dialogState, setDialogState] = useState<{
        open: boolean;
        action: 'disable' | 'promote' | null;
        title: string;
        description: string;
    }>({ open: false, action: null, title: '', description: '' });
    
    const canManageUsers = useSelector(selectCan(Permission.MANAGE_USERS));
    
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 500); // Shorter delay now that data is local
      return () => clearTimeout(timer);
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const roleMatch = filters.role ? user.role === filters.role : true;
            const deptMatch = filters.departmentId ? user.departmentId === filters.departmentId : true;
            const searchMatch = filters.q ? 
                user.name.toLowerCase().includes(filters.q.toLowerCase()) || 
                user.email.toLowerCase().includes(filters.q.toLowerCase()) : true;
            return roleMatch && deptMatch && searchMatch;
        });
    }, [users, filters]);
    
    useEffect(() => {
        setSelectedUsers([]);
    }, [filters, users]);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUsers(filteredUsers.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleOpenUserModal = (user: User | null) => {
        setEditingUser(user);
        setUserModalOpen(true);
    };
    
    const handleConfirmAction = () => {
        if (dialogState.action === 'disable') {
            dispatch(bulkUpdateUsersStatusRequest({ userIds: selectedUsers, status: 'Inactive' }));
        } else if (dialogState.action === 'promote') {
            dispatch(bulkPromoteStudentsRequest({ userIds: selectedUsers }));
        }
        
        setDialogState({ open: false, action: null, title: '', description: '' });
        setSelectedUsers([]);
    };

    const isAllSelected = useMemo(() => {
        return filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;
    }, [selectedUsers, filteredUsers]);


    const renderUserTable = () => (
      <Card>
        <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>A list of all users in the system. Use the filters above to narrow down the results.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 px-4">
                    {canManageUsers && (
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            disabled={filteredUsers.length === 0}
                            aria-label="Select all users on this page"
                        />
                    )}
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Department</TableHead>
                  <TableHead>Status</TableHead>
                  {canManageUsers && <TableHead><span className="sr-only">Actions</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id} data-state={selectedUsers.includes(user.id) ? 'selected' : ''}>
                    <TableCell className="px-4">
                        {canManageUsers && (
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                                aria-label={`Select user ${user.name}`}
                            />
                        )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/profile/${user.id}`} className="hover:opacity-80 transition-opacity">
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{user.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{user.role}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{DEPARTMENTS.find(d => d.id === user.departmentId)?.name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{user.status}</span>
                    </TableCell>
                    {canManageUsers && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenUserModal(user)}><PencilIcon className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => dispatch(bulkUpdateUsersStatusRequest({ userIds: [user.id], status: 'Inactive' }))}
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />Disable
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && <EmptyState title="No Users Found" message="Try adjusting your filters or creating a new user." />}
        </CardContent>
      </Card>
    );

    const renderSkeleton = () => (
        <Card>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Dialog open={dialogState.open} onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogState.title}</DialogTitle>
                        <DialogDescription>{dialogState.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setDialogState({ open: false, action: null, title: '', description: '' })}>Cancel</Button>
                        <Button 
                            variant={dialogState.action === 'disable' ? 'destructive' : 'primary'}
                            onClick={handleConfirmAction}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setUserModalOpen(false)}
                user={editingUser}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-slate-600">Manage all users across the institution.</p>
                </div>
                {canManageUsers && (
                  <div className="flex space-x-2">
                      <Button size="sm" leftIcon={<UserAddIcon className="w-4 h-4"/>} onClick={() => handleOpenUserModal(null)}>Add User</Button>
                  </div>
                )}
            </div>

            <Card className="overflow-visible">
                <CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                            placeholder="Search by name or email..." 
                            value={filters.q}
                            onChange={(e) => handleFilterChange('q', e.target.value)}
                        />
                         <Select onValueChange={(value) => handleFilterChange('role', value)} value={filters.role}>
                            <SelectTrigger><SelectValue placeholder="Filter by role..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Roles</SelectItem>
                                {Object.values(UserRole).map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => handleFilterChange('departmentId', value)} value={filters.departmentId}>
                            <SelectTrigger><SelectValue placeholder="Filter by department..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Departments</SelectItem>
                                {DEPARTMENTS.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            <AnimatePresence>
                {selectedUsers.length > 0 && canManageUsers && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between"
                    >
                        <p className="text-sm font-medium text-blue-800">{selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected</p>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => setDialogState({ 
                                    open: true, 
                                    action: 'promote', 
                                    title: `Promote ${selectedUsers.length} Users?`,
                                    description: `Are you sure you want to promote ${selectedUsers.length} selected students? This may change their roles and permissions.`
                                })}
                            >
                                Promote Selected
                            </Button>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                className="!bg-red-100 !text-red-700 hover:!bg-red-200"
                                onClick={() => setDialogState({
                                    open: true,
                                    action: 'disable',
                                    title: `Disable ${selectedUsers.length} Users?`,
                                    description: 'This will prevent them from logging in. This action can be undone later.'
                                })}
                            >
                                Disable Users
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {loading ? renderSkeleton() : renderUserTable()}
        </div>
    );
};

const ValidationTooltip: React.FC<{ message: string }> = ({ message }) => (
    <div
      className="absolute left-4 top-full mt-2 z-10 p-2 w-max bg-slate-800 text-white text-xs rounded-lg shadow-lg flex items-center"
      role="alert"
    >
      <div className="absolute -top-1 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-800"></div>
      <ExclamationCircleIcon className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0" />
      <span>{message}</span>
    </div>
);

const UserModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User | null }> = ({ isOpen, onClose, user }) => {
    const dispatch = useDispatch<AppDispatch>();
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData(user);
            } else {
                setFormData({
                    name: '', email: '', role: UserRole.STUDENT, departmentId: '', status: StudentStatus.ACTIVE
                });
            }
            setErrors({});
            setIsDragging(false);
        }
    }, [user, isOpen]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name?.trim()) newErrors.name = 'Please fill out this field.';
        if (!formData.email?.trim()) {
            newErrors.email = 'Please fill out this field.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    const handleSelectChange = (key: keyof User, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        if (user) {
            dispatch(updateUserInListRequest(formData as User));
        } else {
            dispatch(addUserRequest(formData as Omit<User, 'id' | 'permissions'>));
        }
        onClose();
    };

    const processFile = (file: File) => {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            dispatch(showToast({ type: 'error', message: 'Invalid file type. Please upload a CSV file.' }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            try {
                const lines = text.split(/[\r\n]+/).filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    throw new Error('CSV file is empty or has no data rows.');
                }
                const header = lines[0].split(',').map(h => h.trim());
                
                const expectedHeaders = ['Reg No', 'Name', 'Email', 'Phone', 'Year', 'Department', 'Section'];
                const missingHeaders = expectedHeaders.filter(h => !header.includes(h));
                if (missingHeaders.length > 0) {
                    throw new Error(`Invalid CSV header. Missing columns: ${missingHeaders.join(', ')}`);
                }
                
                const headerMap = header.reduce((acc, h, i) => ({...acc, [h]: i}), {} as Record<string, number>);

                const newStudents: Omit<Student, 'id' | 'permissions' | 'cgpa' | 'sgpa' | 'totalWorkingDays' | 'daysPresent' | 'address' | 'photoUrl' | 'dues'>[] = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim());
                    if(values.length < expectedHeaders.length) continue;

                    const departmentName = values[headerMap['Department']];
                    const department = DEPARTMENTS.find(d => d.name.toLowerCase() === departmentName.toLowerCase());
                    if (!department) {
                        console.warn(`Department "${departmentName}" not found. Skipping user ${values[headerMap['Name']]}.`);
                        continue;
                    }

                    const year = parseInt(values[headerMap['Year']], 10);
                    if (isNaN(year)) {
                         console.warn(`Invalid year for user ${values[headerMap['Name']]}. Skipping.`);
                        continue;
                    }

                    const studentData: Omit<Student, 'id' | 'permissions' | 'cgpa' | 'sgpa' | 'totalWorkingDays' | 'daysPresent' | 'address' | 'photoUrl' | 'dues'> = {
                        regNo: values[headerMap['Reg No']],
                        name: values[headerMap['Name']],
                        email: values[headerMap['Email']],
                        phone: values[headerMap['Phone']],
                        year: year,
                        departmentId: department.id,
                        section: values[headerMap['Section']],
                        admissionYear: new Date().getFullYear() - (year - 1),
                        role: UserRole.STUDENT,
                        status: StudentStatus.ACTIVE,
                    };
                    newStudents.push(studentData);
                }

                if(newStudents.length > 0) {
                    dispatch(bulkAddUsersRequest(newStudents));
                    onClose();
                } else {
                    dispatch(showToast({ type: 'error', message: 'No valid student records found in the file.' }));
                }

            } catch (error) {
                 if (error instanceof Error) {
                    dispatch(showToast({ type: 'error', message: error.message }));
                } else {
                    dispatch(showToast({ type: 'error', message: 'An error occurred while parsing the file.' }));
                }
            }
        };
        reader.readAsText(file);
    };

    const handleFileDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add New User(s)'}</DialogTitle>
                     {!user && <DialogDescription>Add a single user manually or import multiple users from a file.</DialogDescription>}
                </DialogHeader>

                {user ? (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                    <Input id="edit-name" name="name" placeholder="e.g. John Doe" value={formData.name || ''} onChange={handleChange} className="pl-10" />
                                    {errors.name && <ValidationTooltip message={errors.name} />}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                                <div className="relative">
                                    <MailIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                    <Input id="edit-email" name="email" type="email" placeholder="e.g. john.doe@lms.com" value={formData.email || ''} onChange={handleChange} className="pl-10" />
                                    {errors.email && <ValidationTooltip message={errors.email} />}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label htmlFor="edit-role" className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                                    <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                                        <SelectTrigger id="edit-role"><SelectValue placeholder="Role" /></SelectTrigger>
                                        <SelectContent>{Object.values(UserRole).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label htmlFor="edit-department" className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                                    <Select value={formData.departmentId} onValueChange={(v) => handleSelectChange('departmentId', v)}>
                                        <SelectTrigger id="edit-department"><SelectValue placeholder="Department" /></SelectTrigger>
                                        <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <Tabs defaultValue="single" className="w-full px-6 pb-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="single">Single User</TabsTrigger>
                            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                        </TabsList>
                        <TabsContent value="single" className="pt-6">
                           <form onSubmit={handleSubmit} noValidate>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                        <div className="relative">
                                            <UserIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                            <Input id="name" name="name" placeholder="e.g. John Doe" value={formData.name || ''} onChange={handleChange} className="pl-10" />
                                            {errors.name && <ValidationTooltip message={errors.name} />}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                                        <div className="relative">
                                            <MailIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                            <Input id="email" name="email" type="email" placeholder="e.g. john.doe@lms.com" value={formData.email || ''} onChange={handleChange} className="pl-10" />
                                            {errors.email && <ValidationTooltip message={errors.email} />}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                                            <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                                                <SelectTrigger id="role"><SelectValue placeholder="Role" /></SelectTrigger>
                                                <SelectContent>{Object.values(UserRole).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label htmlFor="department" className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                                            <Select value={formData.departmentId} onValueChange={(v) => handleSelectChange('departmentId', v)}>
                                                <SelectTrigger id="department"><SelectValue placeholder="Department" /></SelectTrigger>
                                                <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="pt-8 px-0 pb-0">
                                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                    <Button type="submit">Add User</Button>
                                </DialogFooter>
                            </form>
                        </TabsContent>
                        <TabsContent value="bulk" className="pt-6">
                             <DialogDescription>
                                Upload a CSV file with student data. Columns: Reg No, Name, Email, Phone, Year, Department, Section.
                            </DialogDescription>
                            <input id="csv-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileInputChange} />
                            <label 
                                htmlFor="csv-upload"
                                className={`cursor-pointer mt-4 p-10 border-2 border-dashed rounded-xl text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleFileDrop}
                            >
                                <UploadIcon className="w-12 h-12 mx-auto text-slate-300" />
                                <p className="mt-2 text-sm text-slate-600">
                                    Drag & drop your CSV file here or click to browse
                                </p>
                            </label>
                             <DialogFooter className="pt-8 px-0 pb-0">
                                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            </DialogFooter>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserManagement;
