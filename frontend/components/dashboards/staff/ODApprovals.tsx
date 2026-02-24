import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllODApplications, processODRequest, selectAllUsers, selectAllClasses } from '../../../store/slices/appSlice';
import { User, Student, UserRole, OnDutyApplication } from '../../../types';
import EmptyState from '../../shared/EmptyState';

const ODApprovals: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const allApplications = useSelector(selectAllODApplications);
    const allUsers = useSelector(selectAllUsers);
    const allClasses = useSelector(selectAllClasses);

    const pendingApplications = useMemo(() => {
        if (!user) return [];
        
        let filteredApps: OnDutyApplication[] = [];

        // This logic determines which requests are visible to the current user.
        if (user.role === UserRole.STAFF) { // Advisor
            const advisoryClasses = allClasses.filter(c => c.advisorId === user.id);
            if (advisoryClasses.length > 0) {
                const adviseeIds = allUsers
                    .filter(u => u.role === UserRole.STUDENT && advisoryClasses.some(ac => ac.departmentId === u.departmentId && (u as Student).year === ac.year))
                    .map(u => u.id);
                
                filteredApps = allApplications.filter(app => 
                    app.status === 'Pending Advisor' && adviseeIds.includes(app.applicantId)
                );
            }
        } else if (user.role === UserRole.HOD) { // Head of Department
            const deptStaffIds = allUsers.filter(u => u.departmentId === user.departmentId && u.role === UserRole.STAFF).map(u => u.id);
            const deptStudentIds = allUsers.filter(u => u.departmentId === user.departmentId && u.role === UserRole.STUDENT).map(u => u.id);

            filteredApps = allApplications.filter(app => 
                app.status === 'Pending HOD' && (deptStudentIds.includes(app.applicantId) || deptStaffIds.includes(app.applicantId))
            );
        } else if (user.role === UserRole.PRINCIPAL) { // Principal
            const hodIds = allUsers.filter(u => u.role === UserRole.HOD).map(u => u.id);
             filteredApps = allApplications.filter(app => app.status === 'Pending Principal' && hodIds.includes(app.applicantId));
        }
        
        return filteredApps
            .map(app => ({
                ...app,
                applicant: allUsers.find(u => u.id === app.applicantId) as User | undefined,
            }))
            .filter(app => !!app.applicant);

    }, [user, allApplications, allUsers, allClasses]);

    const handleUpdate = (applicationId: string, decision: 'approve' | 'reject') => {
        if (!user) return;
        dispatch(processODRequest({ applicationId, decision }));
    };
    
    const getApproveButtonText = (applicantRole?: UserRole) => {
        if (user?.role === UserRole.STAFF) return 'Forward to HOD';
        if (user?.role === UserRole.HOD && applicantRole === UserRole.STUDENT) return 'Forward to Principal';
        return 'Approve';
    };


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Leave / OD Approvals</h1>
                <p className="text-slate-600">Review and approve requests from students.</p>
            </div>
            <Card>
                <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {pendingApplications.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApplications.map(app => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <span className="px-2 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-800">
                                                    {app.applicant?.name}
                                                </span>
                                            </TableCell>
                                            <TableCell>{app.type}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                <span className="px-2 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-800" title={app.reason}>
                                                    {app.reason}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-800">
                                                    {app.fromDate} to {app.toDate}
                                                </span>
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button size="sm" onClick={() => handleUpdate(app.id, 'approve')}>
                                                    {getApproveButtonText(app.applicant?.role)}
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleUpdate(app.id, 'reject')}>Reject</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState title="No Pending Requests" message="All applications have been processed." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ODApprovals;