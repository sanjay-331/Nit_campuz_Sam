import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { UploadIcon, CheckCircleIcon, XIcon } from '../../icons/Icons';
import { Alumnus } from '../../../types';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Skeleton } from '../../ui/Skeleton';
import EmptyState from '../../shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus } from '../../../types';

const AlumniManagement: React.FC = () => {
    const users = useSelector(selectAllUsers);
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const alumniList = useMemo(() => users.filter(u => u.role === UserRole.STUDENT && (u as any).status === StudentStatus.ALUMNI) as unknown as Alumnus[], [users]);

    const [loading, setLoading] = useState(true);
    const [alumni, setAlumni] = useState<Alumnus[]>(alumniList);
    const [filters, setFilters] = useState({ departmentId: '', graduationYear: '', q: '' });
    const [selectedAlumni, setSelectedAlumni] = useState<string[]>([]);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const graduationYears = useMemo(() => [...new Set(alumniList.map((a: any) => a.graduationYear))].sort((a: any, b: any) => b - a), [alumniList]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if(toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const filteredAlumni = useMemo(() => {
        return alumni.filter(alum => {
            const deptMatch = filters.departmentId ? alum.departmentId === filters.departmentId : true;
            const yearMatch = filters.graduationYear ? alum.graduationYear.toString() === filters.graduationYear : true;
            // FIX: Replaced property 'rollNo' with 'regNo' as it is the correct property on the Alumnus type.
            const searchMatch = filters.q ? 
                alum.name.toLowerCase().includes(filters.q.toLowerCase()) || 
                alum.regNo.toLowerCase().includes(filters.q.toLowerCase()) : true;
            return deptMatch && yearMatch && searchMatch;
        });
    }, [alumni, filters]);

     useEffect(() => {
        setSelectedAlumni([]);
    }, [filters]);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedAlumni(filteredAlumni.map(a => a.id));
        } else {
            setSelectedAlumni([]);
        }
    };

    const handleSelectAlumnus = (alumnusId: string) => {
        setSelectedAlumni(prev =>
            prev.includes(alumnusId)
                ? prev.filter(id => id !== alumnusId)
                : [...prev, alumnusId]
        );
    };

    const handleConfirmExport = () => {
        setConfirmOpen(false);
        setSelectedAlumni([]);
        setToast(`${selectedAlumni.length} alumni records exported successfully.`);
    };

    const isAllSelected = useMemo(() => {
        return filteredAlumni.length > 0 && selectedAlumni.length === filteredAlumni.length;
    }, [selectedAlumni, filteredAlumni]);


    const renderTable = () => (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 px-4">
                                     <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        disabled={filteredAlumni.length === 0}
                                        aria-label="Select all alumni on this page"
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Roll No</TableHead>
                                <TableHead className="hidden md:table-cell">Department</TableHead>
                                <TableHead>Grad. Year</TableHead>
                                <TableHead className="hidden lg:table-cell">Company</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAlumni.map(alum => (
                                <TableRow key={alum.id} data-state={selectedAlumni.includes(alum.id) ? 'selected' : ''}>
                                    <TableCell className="px-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedAlumni.includes(alum.id)}
                                            onChange={() => handleSelectAlumnus(alum.id)}
                                            aria-label={`Select alumnus ${alum.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {alum.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {/* FIX: Replaced property 'rollNo' with 'regNo' as it is the correct property on the Alumnus type. */}
                                            {alum.regNo}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {DEPARTMENTS.find(d => d.id === alum.departmentId)?.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {alum.graduationYear}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {alum.company || 'N/A'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {filteredAlumni.length === 0 && <EmptyState title="No Alumni Found" message="Try adjusting your filters to find alumni records." />}
            </CardContent>
        </Card>
    );

     const renderSkeleton = () => (
        <Card>
            <CardContent className="p-0">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 px-4"><Skeleton className="h-4 w-4" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                            <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-28" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {[...Array(5)].map((_, i) => (
                           <TableRow key={i}>
                               <TableCell className="px-4"><Skeleton className="h-4 w-4" /></TableCell>
                               <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                               <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                               <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                               <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                               <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
                           </TableRow>
                       ))}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
             <AnimatePresence>
                {toast && (
                     <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="fixed bottom-6 right-6 z-50 w-full max-w-sm p-4 bg-gray-800 text-white rounded-2xl shadow-lg flex items-center"
                    >
                        <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3" />
                        <div>
                            <p className="font-semibold">{toast}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="ml-auto p-1 rounded-full hover:bg-gray-700">
                           <XIcon className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Export</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to export the data for the {selectedAlumni.length} selected alumni?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmExport}>Confirm Export</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Alumni Management</h1>
                    <p className="text-slate-600">Explore records of graduated students.</p>
                </div>
                 <Button variant="secondary" size="sm" leftIcon={<UploadIcon className="w-4 h-4" />}>
                    Export List
                </Button>
            </div>
            
            <Card className="overflow-visible">
                <CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                            placeholder="Search by name or roll no..." 
                            value={filters.q}
                            onChange={(e) => handleFilterChange('q', e.target.value)}
                        />
                         <Select onValueChange={(value) => handleFilterChange('departmentId', value)} value={filters.departmentId}>
                            <SelectTrigger><SelectValue placeholder="Filter by department..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Departments</SelectItem>
                                {DEPARTMENTS.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => handleFilterChange('graduationYear', value)} value={filters.graduationYear}>
                            <SelectTrigger><SelectValue placeholder="Filter by graduation year..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Years</SelectItem>
                                {graduationYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            <AnimatePresence>
                {selectedAlumni.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between"
                    >
                        <p className="text-sm font-medium text-blue-800">{selectedAlumni.length} alumni{selectedAlumni.length > 1 ? 's' : ''} selected</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" leftIcon={<UploadIcon className="w-4 h-4" />} onClick={() => setConfirmOpen(true)}>Export Data</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? renderSkeleton() : renderTable()}
        </div>
    );
};

export default AlumniManagement;