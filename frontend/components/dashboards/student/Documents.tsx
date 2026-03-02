import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { AppDispatch } from '../../../store';
import { selectStudentDocuments, fetchStudentDocumentsRequest, uploadDocumentRequest } from '../../../store/slices/appSlice';
import { selectUser } from '../../../store/slices/authSlice';
import { FileTextIcon, UploadIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../../icons/Icons';

const Documents: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const documents = useSelector(selectStudentDocuments);
    const user = useSelector(selectUser);
    
    const [title, setTitle] = useState('');
    const [fileUrl, setFileUrl] = useState(''); // In a real app, this would be a file upload to S3/Cloudinary

    useEffect(() => {
        dispatch(fetchStudentDocumentsRequest());
    }, [dispatch]);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !fileUrl) return;
        
        dispatch(uploadDocumentRequest({ title, fileUrl }));
        setTitle('');
        setFileUrl('');
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'Verified':
                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Verified</span>;
            case 'Rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><XCircleIcon className="w-3 h-3" /> Rejected</span>;
            default:
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold italic tracking-tight">My Documents</h1>
                    <p className="text-slate-500">Upload and track your certificates for verification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Upload New Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 10th Marksheet"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">File URL (Mock)</label>
                                <input 
                                    type="text" 
                                    placeholder="https://example.com/file.pdf"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">* In production, this would be a file picker.</p>
                            </div>
                            <Button type="submit" className="w-full flex items-center justify-center gap-2">
                                <UploadIcon className="w-4 h-4" /> Upload Document
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {documents.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <FileTextIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>No documents uploaded yet.</p>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div key={doc.id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <FileTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{doc.title}</h4>
                                                <p className="text-xs text-slate-400">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <StatusBadge status={doc.status} />
                                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">
                                                View
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Documents;
