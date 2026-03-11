import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllODApplications, applyForODRequest, updateODApplicationRequest } from '../../../store/slices/appSlice';
import { OnDutyApplication } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/Select';
import { PlusIcon, PencilIcon, ClockIcon } from '../../icons/Icons';

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
        setEditingApp({
            ...app,
            fromDate: app.fromDate?.includes('T') ? app.fromDate.split('T')[0] : app.fromDate,
            toDate: app.toDate?.includes('T') ? app.toDate.split('T')[0] : app.toDate
        });
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
            type: editingApp.type
        }));
        handleCloseEditModal();
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusIndicator = (status: string) => {
         switch (status) {
            case 'Approved': return 'bg-emerald-500';
            case 'Rejected': return 'bg-rose-500';
            default: return 'bg-amber-500';
        }
    };

    return (
        <div className="space-y-6">
            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-50/95 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Edit Application</DialogTitle>
                        <DialogDescription>Modify your pending leave or OD request details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateApplication} className="space-y-5 pt-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-type" className="block text-sm font-semibold text-slate-700 mb-1.5">Application Type</label>
                                <Select value={editingApp?.type} onValueChange={(v) => setEditingApp(prev => prev ? { ...prev, type: v as 'OD' | 'Leave' } : null)}>
                                    <SelectTrigger className="w-full bg-white border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OD">On-Duty (OD)</SelectItem>
                                        <SelectItem value="Leave">Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="edit-reason" className="block text-sm font-semibold text-slate-700 mb-1.5">Reason / Description</label>
                                <textarea
                                    id="edit-reason"
                                    rows={3}
                                    value={editingApp?.reason || ''}
                                    onChange={e => setEditingApp(prev => prev ? { ...prev, reason: e.target.value } : null)}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label htmlFor="edit-fromDate" className="block text-sm font-semibold text-slate-700 mb-1.5">From Date</label>
                                    <Input type="date" id="edit-fromDate" value={editingApp?.fromDate || ''} onChange={e => setEditingApp(prev => prev ? { ...prev, fromDate: e.target.value } : null)} className="bg-white border-slate-200" required />
                                </div>
                                <div>
                                    <label htmlFor="edit-toDate" className="block text-sm font-semibold text-slate-700 mb-1.5">To Date</label>
                                    <Input type="date" id="edit-toDate" value={editingApp?.toDate || ''} onChange={e => setEditingApp(prev => prev ? { ...prev, toDate: e.target.value } : null)} className="bg-white border-slate-200" required />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0 mt-6">
                            <Button type="button" variant="ghost" onClick={handleCloseEditModal} className="text-slate-500">Cancel</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">Update Request</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave & On-Duty</h1>
                    <p className="text-slate-500 mt-1">Manage your official absences and campus leave requests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="border-slate-200 shadow-sm sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">New Application</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                   <label htmlFor="type" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Application Type</label>
                                    <Select value={type} onValueChange={(v) => setType(v as 'OD' | 'Leave')}>
                                        <SelectTrigger className="w-full bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OD">On-Duty (OD)</SelectItem>
                                            <SelectItem value="Leave">Leave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="reason" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</label>
                                    <textarea
                                        id="reason"
                                        rows={4}
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                        placeholder="Detailed reason for your request..."
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label htmlFor="fromDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider">From Date</label>
                                        <Input type="date" id="fromDate" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-slate-50 border-slate-200" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="toDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Date</label>
                                        <Input type="date" id="toDate" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-slate-50 border-slate-200" required />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 h-11" leftIcon={<PlusIcon className="w-4 h-4" />}>
                                    Submit Application
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-lg">Application History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {myApplications.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b bg-slate-50/50">
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider pointer-events-none"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {myApplications.map(app => {
                                                return (
                                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="p-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${app.type === 'OD' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                {app.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="max-w-[200px]">
                                                                <p className="text-sm font-semibold text-slate-800 truncate" title={app.reason}>{app.reason}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-xs font-medium text-slate-600">
                                                                {new Date(app.fromDate).toLocaleDateString()} - {new Date(app.toDate).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${getStatusStyles(app.status)}`}>
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${app.status.startsWith('Pending') ? 'bg-amber-400' : 'hidden'}`}></span>
                                                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusIndicator(app.status)}`}></span>
                                                                </span>
                                                                {app.status}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {app.status.startsWith('Pending') && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => handleOpenEditModal(app)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                                >
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <ClockIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">No applications found in your history.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OnDuty;