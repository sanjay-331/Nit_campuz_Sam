import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { selectAllUsers, updateUserPermissionsRequest } from '../store/slices/appSlice';
import { User, UserRole, Permission } from '../types';
import { PERMISSION_DESCRIPTIONS, DEPARTMENTS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog';
import { Switch } from '../components/ui/Switch';
import Button from '../components/ui/Button';
import { ShieldCheckIcon } from '../components/icons/Icons';
import EmptyState from '../components/shared/EmptyState';

// Main page component - decides which view to show based on user role
const PermissionsPage: React.FC = () => {
    const user = useSelector(selectUser);

    if (user?.role === UserRole.ADMIN) {
        return <AdminPermissionsManagement />;
    }
    return <MyPermissionsView />;
};


// View for non-admin users to see their own permissions
const MyPermissionsView: React.FC = () => {
    const user = useSelector(selectUser);

    if (!user) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">My Permissions</h1>
                <p className="text-slate-600">This is a list of actions you are authorized to perform in the system.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Permissions for {user.role}</CardTitle>
                </CardHeader>
                <CardContent>
                    {user.permissions.length > 0 ? (
                        <ul className="space-y-4">
                            {user.permissions.map(permission => (
                                <li key={permission} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <ShieldCheckIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {Object.keys(Permission).find(key => Permission[key as keyof typeof Permission] === permission)}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {PERMISSION_DESCRIPTIONS[permission]}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <EmptyState 
                          title="No Special Permissions"
                          message="Your role has standard access. If you believe this is an error, please contact an administrator."
                       />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


// Admin view for managing all users' permissions
const AdminPermissionsManagement: React.FC = () => {
    const users = useSelector(selectAllUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleOpenModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <PermissionEditModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                user={editingUser}
            />
            <div>
                <h1 className="text-3xl font-bold">Permissions Management</h1>
                <p className="text-slate-600">Assign and manage permissions for all users in the system.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">Name</span>
                                    </TableHead>
                                    <TableHead>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">Role</span>
                                    </TableHead>
                                    <TableHead>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">Department</span>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">Action</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">{user.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">{user.role}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">{DEPARTMENTS.find(d => d.id === user.departmentId)?.name || 'N/A'}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenModal(user)} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                                                Manage Permissions
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Modal for editing a single user's permissions
const PermissionEditModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User | null }> = ({ isOpen, onClose, user }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [currentPermissions, setCurrentPermissions] = useState<Permission[]>([]);
    
    useEffect(() => {
        if (user && isOpen) {
            setCurrentPermissions(user.permissions || []);
        }
    }, [user, isOpen]);
    
    if (!user) return null;

    const allPermissions = Object.values(Permission);

    const handlePermissionChange = (permission: Permission, isEnabled: boolean) => {
        if (isEnabled) {
            setCurrentPermissions(prev => [...prev, permission]);
        } else {
            setCurrentPermissions(prev => prev.filter(p => p !== permission));
        }
    };

    const handleSave = () => {
        dispatch(updateUserPermissionsRequest({ userId: user.id, permissions: currentPermissions }));
        onClose();
    };

    return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Permissions for {user.name}</DialogTitle>
                    <DialogDescription>
                        Enable or disable permissions for this user. Changes will take effect immediately.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        {allPermissions.map(permission => (
                            <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-sm text-gray-900">
                                        {Object.keys(Permission).find(key => Permission[key as keyof typeof Permission] === permission)}
                                    </h4>
                                    <p className="text-xs text-gray-500">{PERMISSION_DESCRIPTIONS[permission]}</p>
                                </div>
                                <Switch 
                                    checked={currentPermissions.includes(permission)} 
                                    onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                                    aria-label={`Toggle ${permission} permission`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Permissions</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PermissionsPage;