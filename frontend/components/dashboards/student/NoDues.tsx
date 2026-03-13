import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { AppDispatch } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllNoDuesCertificates, issueNoDuesCertificateRequest } from '../../../store/slices/appSlice';
import { Student } from '../../../types';
import { CheckCircleIcon, XIcon, ShieldCheckIcon } from '../../icons/Icons';

const NoDues: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser) as Student | null;
    const allCertificates = useSelector(selectAllNoDuesCertificates);

    const myCertificate = useMemo(() => {
        if (!user) return null;
        return allCertificates.find(c => c.studentId === user.id);
    }, [user, allCertificates]);

    if (!user) return null;
    
    const allDuesCleared = user.dues.library && user.dues.department && user.dues.accounts;

    const handleRequestCertificate = () => {
        dispatch(issueNoDuesCertificateRequest(user.id));
    };

    const handleDownload = () => {
        const token = localStorage.getItem('lms_token');
        const url = `${import.meta.env.VITE_BASE_URL || 'https://nitcampuz-production.up.railway.app'}/api/academic/report/no-dues/${user.id}`;
        
        // Use fetch to download the file with authorization
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob();
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `No_Dues_Certificate_${user.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        })
        .catch(error => {
            console.error('Error downloading PDF:', error);
            // Optionally dispatch a toast error here
        });
    };

    const DueItem: React.FC<{ title: string, cleared: boolean }> = ({ title, cleared }) => (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
            <p className="font-medium text-slate-700">{title}</p>
            {cleared ? (
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-semibold text-sm">Cleared</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-red-600">
                    <XIcon className="w-5 h-5" />
                    <span className="font-semibold text-sm">Pending</span>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">No Dues Certificate</h1>
                <p className="text-gray-500">Check your dues status and request your certificate upon clearance.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Dues Status</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <DueItem title="Library Dues" cleared={user.dues.library} />
                            <DueItem title="Department Dues" cleared={user.dues.department} />
                            <DueItem title="Accounts Dues" cleared={user.dues.accounts} />
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader><CardTitle>Certificate Status</CardTitle></CardHeader>
                        <CardContent className="text-center">
                            {myCertificate?.status === 'Issued' ? (
                                <>
                                    <ShieldCheckIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <h3 className="font-bold text-green-700">Certificate Issued!</h3>
                                    <p className="text-xs text-slate-500 mt-1">Issued on: {myCertificate.issuedAt ? new Date(myCertificate.issuedAt).toLocaleDateString() : 'N/A'}</p>
                                    <Button size="sm" className="mt-4 w-full" onClick={handleDownload}>Download Certificate</Button>
                                </>
                            ) : myCertificate?.status === 'Requested' ? (
                                <>
                                    <p className="text-slate-600 p-4 bg-blue-50 rounded-xl">Your request is being processed by the administration.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-600 mb-4">{allDuesCleared ? 'All your dues are cleared. You can now request your certificate.' : 'You must clear all pending dues before you can request a certificate.'}</p>
                                    <Button onClick={handleRequestCertificate} disabled={!allDuesCleared}>Request Certificate</Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NoDues;