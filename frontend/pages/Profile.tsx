import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUserRequest, deleteAccountRequest } from '../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { DEPARTMENTS, STUDENTS, STAFF } from '../constants';
import { UserIcon, MailIcon, BriefcaseIcon, OfficeBuildingIcon, UsersIcon, AcademicCapIcon, ShieldCheckIcon, CheckCircleIcon, XIcon, WarningIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';
import { UserRole, Permission, User } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { AppDispatch } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const ProfilePage: React.FC = () => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch<AppDispatch>();

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirmPass: '' });
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if(user) {
            setFormData({ name: user.name, phone: user.phone || '' });
        }
    }, [user]);

    useEffect(() => {
        if(toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (!user) {
        return <div>Loading user profile...</div>;
    }

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(updateUserRequest({ name: formData.name, phone: formData.phone }));
        setEditModalOpen(false);
        setToast("Profile updated successfully!");
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would add validation logic
        setPasswordModalOpen(false);
        setPasswordData({ current: '', newPass: '', confirmPass: '' });
        setToast("Password changed successfully!");
    };
    
    const handleDeleteAccount = () => {
        dispatch(deleteAccountRequest());
        setDeleteModalOpen(false);
        // The saga will handle logging out
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const department = DEPARTMENTS.find(d => d.id === user.departmentId);

    const keyAdminPermissions = [
        Permission.MANAGE_USERS,
        Permission.MANAGE_DEPARTMENTS,
        Permission.CONFIGURE_SYSTEM,
        Permission.VIEW_LOGS,
    ];

    const keyAdminPermissionNames: Record<string, string> = {
        'users:manage': 'Manage Users',
        'departments:manage': 'Manage Departments',
        'system:configure': 'Configure System',
        'logs:view': 'View System Logs'
    };


    const renderRoleSpecificInfo = () => {
        if (user.role === UserRole.ADMIN) {
            return (
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Admin Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Key Permissions</h3>
                            <ul className="space-y-2">
                                {keyAdminPermissions.map(p => (
                                    user.permissions.includes(p) && (
                                        <li key={p} className="flex items-center text-sm text-slate-600">
                                            <ShieldCheckIcon className="w-4 h-4 mr-2 text-green-500" />
                                            <span>{keyAdminPermissionNames[p]}</span>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-xl text-center">
                             <p className="text-sm text-slate-600 mb-4">You have the highest level of access to manage system-wide settings and users.</p>
                             <Link to="/users">
                                <Button size="sm">Manage Users</Button>
                             </Link>
                        </div>
                    </CardContent>
                </Card>
            );
        }
        
        if (user.role === UserRole.PRINCIPAL) {
            return (
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Institutional Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <UsersIcon className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                            <p className="text-3xl font-bold text-slate-800">{STAFF.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Staff</p>
                        </div>
                         <div className="p-4 bg-slate-50 rounded-xl">
                            <AcademicCapIcon className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                            <p className="text-3xl font-bold text-slate-800">{STUDENTS.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Students</p>
                        </div>
                         <div className="p-4 bg-slate-50 rounded-xl">
                            <OfficeBuildingIcon className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                            <p className="text-3xl font-bold text-slate-800">{DEPARTMENTS.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Departments</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return null;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
             <AnimatePresence>
                {toast && (
                     <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="fixed bottom-6 right-6 z-50 w-full max-w-sm p-4 bg-slate-800 text-white rounded-2xl shadow-lg flex items-center"
                    >
                        <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3" />
                        <div>
                            <p className="font-semibold">{toast}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="ml-auto p-1 rounded-full hover:bg-slate-700">
                           <XIcon className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <form onSubmit={handleProfileUpdate}>
                        <DialogHeader>
                            <DialogTitle>Edit Profile Information</DialogTitle>
                            <DialogDescription>Update your name and contact details.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleFormChange} required />
                            <Input name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleFormChange} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPasswordModalOpen} onOpenChange={setPasswordModalOpen}>
                <DialogContent>
                    <form onSubmit={handlePasswordUpdate}>
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>Choose a new, strong password.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <Input name="current" type="password" placeholder="Current Password" value={passwordData.current} onChange={handlePasswordFormChange} required />
                            <Input name="newPass" type="password" placeholder="New Password" value={passwordData.newPass} onChange={handlePasswordFormChange} required />
                            <Input name="confirmPass" type="password" placeholder="Confirm New Password" value={passwordData.confirmPass} onChange={handlePasswordFormChange} required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Change Password</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><WarningIcon className="w-6 h-6 text-red-500" /> Delete Account</DialogTitle>
                        <DialogDescription>Are you sure you want to delete your account? This action is permanent and cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteAccount}>Yes, Delete My Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-slate-600">View and manage your personal information.</p>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                        <p className="text-slate-600">{user.email}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center text-sm">
                            <UserIcon className="w-5 h-5 mr-3 text-slate-400" />
                            <span className="font-medium text-slate-600">Full Name:</span>
                            <span className="ml-auto text-slate-900">{user.name}</span>
                        </div>
                         <div className="flex items-center text-sm">
                            <MailIcon className="w-5 h-5 mr-3 text-slate-400" />
                            <span className="font-medium text-slate-600">Email:</span>
                            <span className="ml-auto text-slate-900">{user.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <MailIcon className="w-5 h-5 mr-3 text-slate-400" />
                            <span className="font-medium text-slate-600">Phone:</span>
                            <span className="ml-auto text-slate-900">{user.phone || 'N/A'}</span>
                        </div>
                         <div className="flex items-start text-sm">
                            <OfficeBuildingIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="font-medium text-slate-600">Address:</span>
                            <span className="ml-auto text-slate-900 text-right">{user.address || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <BriefcaseIcon className="w-5 h-5 mr-3 text-slate-400" />
                            <span className="font-medium text-slate-600">Role:</span>
                             <span className="ml-auto px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">{user.role}</span>
                        </div>
                        {department && (
                            <div className="flex items-center text-sm">
                                <OfficeBuildingIcon className="w-5 h-5 mr-3 text-slate-400" />
                                <span className="font-medium text-slate-600">Department:</span>
                                <span className="ml-auto text-slate-900">{department.name}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <Button variant="secondary" className="w-full" onClick={() => setEditModalOpen(true)}>Edit Profile Information</Button>
                         <Button variant="secondary" className="w-full" onClick={() => setPasswordModalOpen(true)}>Change Password</Button>
                         <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteModalOpen(true)}>Delete Account</Button>
                    </CardContent>
                </Card>
                {renderRoleSpecificInfo()}
            </div>
        </div>
    );
};

export default ProfilePage;