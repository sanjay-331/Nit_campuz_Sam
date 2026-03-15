import React, { useState, useMemo, FormEvent, DragEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import Button from '../../ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { selectAllCourses } from '../../../store/slices/appSlice';
import { PlusIcon, FileTextIcon, PresentationChartBarIcon, VideoCameraIcon, UploadIcon } from '../../icons/Icons';
import EmptyState from '../../shared/EmptyState';
import { Material } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { Input } from '../../ui/Input';
import { AppDispatch } from '../../../store';
import { selectAllMaterials, addMaterialRequest } from '../../../store/slices/appSlice';

const materialIcons: Record<Material['type'], React.ReactNode> = {
    'PDF': <FileTextIcon className="w-6 h-6 text-red-500" />,
    'PPT': <PresentationChartBarIcon className="w-6 h-6 text-orange-500" />,
    'Video Link': <VideoCameraIcon className="w-6 h-6 text-blue-500" />
};

const MaterialsManagement: React.FC = () => {
    const user = useSelector(selectUser);
    const materials = useSelector(selectAllMaterials);
    const COURSES = useSelector(selectAllCourses);
    const dispatch = useDispatch<AppDispatch>();

    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const [newMaterialData, setNewMaterialData] = useState({
        title: '',
        type: 'PDF' as Material['type'],
        url: '',
    });
    
    const myCourses = useMemo(() => COURSES.filter(c => c.staffId === user?.id), [user, COURSES]);
    const materialsForCourse = useMemo(() => {
        return materials.filter(m => m.courseId === selectedCourse);
    }, [selectedCourse, materials]);
    
    const resetForm = () => {
        setNewMaterialData({ title: '', type: 'PDF', url: '' });
        setFile(null);
        setIsDragging(false);
    };

    const handleAddMaterial = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isVideoLink = newMaterialData.type === 'Video Link';

        if (!newMaterialData.title || (isVideoLink && !newMaterialData.url) || (!isVideoLink && !file)) {
            return;
        }

        const newMaterial: Omit<Material, 'id' | 'uploadedAt'> = {
            title: newMaterialData.title,
            type: newMaterialData.type,
            url: isVideoLink ? newMaterialData.url : (file as File).name,
            courseId: selectedCourse,
        };
        dispatch(addMaterialRequest(newMaterial));
        setIsModalOpen(false);
        resetForm();
    };

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };
    
    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    
    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    return (
        <div className="space-y-6">
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) resetForm(); }}>
                <DialogContent>
                    <form onSubmit={handleAddMaterial}>
                        <DialogHeader>
                            <DialogTitle>Add New Material</DialogTitle>
                            <DialogDescription>Upload a new resource for your students.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <Input 
                                name="title" 
                                placeholder="Material Title" 
                                value={newMaterialData.title}
                                onChange={(e) => setNewMaterialData(prev => ({...prev, title: e.target.value}))}
                                required 
                            />
                            <Select 
                                value={newMaterialData.type}
                                onValueChange={(v) => setNewMaterialData(prev => ({...prev, type: v as Material['type']}))}
                            >
                                <SelectTrigger><SelectValue placeholder="Select material type..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="PPT">PPT</SelectItem>
                                    <SelectItem value="Video Link">Video Link</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            {newMaterialData.type === 'Video Link' ? (
                                <Input 
                                    name="url" 
                                    placeholder="URL or File Path" 
                                    value={newMaterialData.url}
                                    onChange={(e) => setNewMaterialData(prev => ({...prev, url: e.target.value}))}
                                    required 
                                />
                            ) : (
                                <label
                                    htmlFor="file-upload"
                                    className={`cursor-pointer block border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500'}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <UploadIcon className="w-10 h-10 mx-auto text-gray-300" />
                                    <p className="mt-2 text-sm text-gray-500 break-words">
                                        {file ? (
                                            <span className="font-medium text-blue-600">{file.name}</span>
                                        ) : (
                                            "Drag & drop your file here or click to browse"
                                        )}
                                    </p>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} />
                                </label>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Add Material</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold">Course Materials</h1>
                    <p className="text-gray-500">Manage learning resources for your courses.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse} >
                        <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Select a course..." /></SelectTrigger>
                        <SelectContent>
                            {myCourses.map(course => <SelectItem key={course.id} value={course.id}>{course.name} ({course.code})</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsModalOpen(true)} disabled={!selectedCourse} leftIcon={<PlusIcon className="w-4 h-4" />}>
                        Add
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Uploaded Resources</CardTitle></CardHeader>
                <CardContent>
                    {selectedCourse ? (
                        materialsForCourse.length > 0 ? (
                            <ul className="space-y-3">
                                {materialsForCourse.map(material => (
                                    <li key={material.id} className="p-4 flex items-center gap-4 border rounded-xl hover:bg-gray-50">
                                        {materialIcons[material.type]}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{material.title}</p>
                                            <p className="text-sm text-gray-500">Uploaded on {material.uploadedAt}</p>
                                        </div>
                                        <Button size="sm" variant="ghost">View</Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState title="No Materials Yet" message="Add a new material to get started." />
                        )
                    ) : (
                        <EmptyState title="No Course Selected" message="Please select a course to view its materials." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MaterialsManagement;
