import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { AppDispatch } from '../../../store';
import { selectPendingDocuments, fetchPendingDocumentsRequest, verifyDocumentRequest } from '../../../store/slices/appSlice';
import { FileTextIcon, CheckCircleIcon, XCircleIcon, ExternalLinkIcon } from '../../icons/Icons';

const DocumentVerification: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const pendingDocuments = useSelector(selectPendingDocuments);

    useEffect(() => {
        dispatch(fetchPendingDocumentsRequest());
    }, [dispatch]);

    const handleVerify = (documentId: string, status: 'Verified' | 'Rejected') => {
        const remarks = status === 'Rejected' ? prompt('Enter reason for rejection:') : undefined;
        if (status === 'Rejected' && remarks === null) return;
        
        dispatch(verifyDocumentRequest({ documentId, status, remarks: remarks || undefined }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold italic tracking-tight">Document Verification</h1>
                <p className="text-slate-500">Review and approve student certificate submissions.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Verifications ({pendingDocuments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-700">Student</th>
                                    <th className="p-4 font-semibold text-slate-700">Document Title</th>
                                    <th className="p-4 font-semibold text-slate-700">Uploaded At</th>
                                    <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {pendingDocuments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-400">
                                            All documents have been processed!
                                        </td>
                                    </tr>
                                ) : (
                                    pendingDocuments.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{doc.user?.name}</span>
                                                    <span className="text-xs text-slate-500">{doc.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-indigo-600">
                                                <div className="flex items-center gap-2">
                                                    <FileTextIcon className="w-4 h-4" />
                                                    {doc.title}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500">
                                                {new Date(doc.uploadedAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <a 
                                                    href={doc.fileUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    <ExternalLinkIcon className="w-3 h-3" /> View
                                                </a>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleVerify(doc.id, 'Verified')}
                                                >
                                                    <CheckCircleIcon className="w-3 h-3 mr-1" /> Verify
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                                                    onClick={() => handleVerify(doc.id, 'Rejected')}
                                                >
                                                    <XCircleIcon className="w-3 h-3 mr-1" /> Reject
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentVerification;
