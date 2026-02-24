import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllODApplications, applyForODRequest, updateODApplicationRequest } from '../../../store/slices/appSlice';
import { OnDutyApplication, UserRole } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/Select';

const OnDuty: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const allApplications = useSelector(selectAllODApplications);

    const [type, setType] = useState<'OD' | 'Leave'>('OD');
    const [reason, setReason] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<OnDutyApplication | null>(null);

    const myApplications = useMemo(() => {
        if (!user) return [];
        return allApplications
            .filter(app => app.applicantId === user.id)
            .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    }, [user, allApplications]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !reason || !fromDate || !toDate) return;
        dispatch(applyForODRequest({ applicantId: user.id, type, reason, fromDate, toDate }));
        setReason('');
        setFromDate('');
        setToDate('');
    };

    const handleOpenEditModal = (app: OnDutyApplication) => {
        setEditingApp(app);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingApp(null);
        setEditModalOpen(false);
    };
    
    const handleUpdateApplication = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingApp) return;
        dispatch(updateODApplicationRequest({
            id: editingApp.id,
            reason: editingApp.reason,
            fromDate: editingApp.fromDate,
            toDate: editingApp.toDate,
        }));
        handleCloseEditModal();
    };
    
    const getStatusInfo = (status: OnDutyApplication['status']) => {
        switch (status) {
            case 'Approved': return { text: 'Approved', chip: 'bg-green-100 text-green-800' };
            case 'Rejected': return { text: 'Rejected', chip: 'bg-red-100 text-red-800' };
            case 'Pending Principal': return { text: 'Pending Principal Approval', chip: 'bg-blue-100 text-blue-800' };
            case 'Pending HOD': return { text: 'Pending HOD Approval', chip: 'bg-yellow-100 text-yellow-800' };
            case 'Pending Advisor':
            default: return { text: 'Pending Advisor Approval', chip: 'bg-orange-100 text-orange-800' };
        }
    }
    
    const canEdit = (app: OnDutyApplication) => {
        if (!user) return false;
        const userRole = user.role;
        const appStatus = app.status;

        if (userRole === UserRole.STUDENT && appStatus === 'Pending Advisor') return true;
        if (userRole === UserRole.STAFF && appStatus === 'Pending HOD') return true;
        if (userRole === UserRole.HOD && appStatus === 'Pending Principal') return true;
        
        return false;
    };


    return (
        <div className="space-y-6">
            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateApplication}>
                        <DialogHeader>
                            <DialogTitle>Edit Application</DialogTitle>
                            <DialogDescription>Update the details of your pending application.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="edit-reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    id="edit-reason"
                                    rows={3}
                                    value={editingApp?.reason || ''}
                                    onChange={e => setEditingApp(prev => prev ? { ...prev, reason: e.target.value } : null)}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label htmlFor="edit-fromDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <Input type="date" id="edit-fromDate" value={editingApp?.fromDate || ''} onChange={e => setEditingApp(prev => prev ? { ...prev, fromDate: e.target.value } : null)} required />
                                </div>
                                <div>
                                    <label htmlFor="edit-toDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <Input type="date" id="edit-toDate" value={editingApp?.toDate || ''} onChange={e => setEditingApp(prev => prev ? { ...prev, toDate: e.target.value } : null)} required />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={handleCloseEditModal}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <div>
                <h1 className="text-3xl font-bold">Leave / On-Duty Application</h1>
                <p className="text-gray-500">Apply for leave or OD and track your application status.</p>
            </div>
            <Card>
                <CardHeader><CardTitle>New Application</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                           <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
                            <Select value={type} onValueChange={(v) => setType(v as 'OD' | 'Leave')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OD">On-Duty (OD)</SelectItem>
                                    <SelectItem value="Leave">Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                id="reason"
                                rows={3}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Attending a technical symposium at..."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <Input type="date" id="fromDate" value={fromDate} onChange={e => setFromDate(e.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <Input type="date" id="toDate" value={toDate} onChange={e => setToDate(e.target.value)} required />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Submit Application</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>My Application History</CardTitle></CardHeader>
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myApplications.map(app => {
                                    const { text, chip } = getStatusInfo(app.status);
                                    return (
                                        <TableRow key={app.id}>
                                            <TableCell>{app.type}</TableCell>
                                            <TableCell className="max-w-xs truncate">{app.reason}</TableCell>
                                            <TableCell>{app.fromDate} to {app.toDate}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${chip}`}>
                                                    {text}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {canEdit(app) && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(app)}>
                                                        Edit
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OnDuty;