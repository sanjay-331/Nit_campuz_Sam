import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DotsHorizontalIcon, PencilIcon, PlusIcon, BookOpenIcon } from '../../icons/Icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllUsers, selectAllCourses, assignCourseRequest, createCourseRequest, fetchCoursesRequest } from '../../../store/slices/appSlice';
import { UserRole, Staff, Course } from '../../../types';
import { selectUser } from '../../../store/slices/authSlice';
import Button from '../../ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/DropdownMenu";
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select";

const StaffManagement: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const users = useSelector(selectAllUsers);
    const COURSES = useSelector(selectAllCourses);

    // Assign course dialog state
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

    // Create course dialog state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', code: '', credits: 3, semester: 1 });

    const STAFF = useMemo(() => users.filter(u => u.role === UserRole.STAFF || u.role === UserRole.HOD) as Staff[], [users]);

    const deptStaff = useMemo(() => {
        return STAFF.filter(s => s.departmentId === user?.departmentId);
    }, [user, STAFF]);

    const deptCourses = useMemo(() => {
        return COURSES.filter(c => c.departmentId === user?.departmentId);
    }, [user, COURSES]);

    const unassignedCourses = useMemo(() => {
        return deptCourses.filter(c => !c.staffId);
    }, [deptCourses]);

    const getAssignedCourses = (staffId: string) => {
        return COURSES.filter(c => c.staffId === staffId).map(c => c.code).join(', ') || 'None';
    }

    const getStaffName = (staffId: string) => {
        const staff = users.find(u => u.id === staffId);
        return staff?.name || 'Unassigned';
    }

    const handleAssignCourse = () => {
        if (selectedStaff && selectedCourse) {
            dispatch(assignCourseRequest({ courseId: selectedCourse, staffId: selectedStaff.id }));
            setIsAssignDialogOpen(false);
            setSelectedCourse('');
            setSelectedStaff(null);
        }
    }

    const handleCreateCourse = () => {
        if (newCourse.name && newCourse.code && user?.departmentId) {
            dispatch(createCourseRequest({
                name: newCourse.name,
                code: newCourse.code,
                credits: newCourse.credits,
                semester: newCourse.semester,
                departmentId: user.departmentId,
            }));
            setIsCreateDialogOpen(false);
            setNewCourse({ name: '', code: '', credits: 3, semester: 1 });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Staff & Course Management</h1>
                    <p className="text-slate-600">Manage staff members and assign courses in your department.</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Create Course
                </Button>
            </div>

            {/* Staff Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Members</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Assigned Courses</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deptStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                            No staff members found in your department.
                                        </TableCell>
                                    </TableRow>
                                ) : deptStaff.map(staff => (
                                <TableRow key={staff.id}>
                                    <TableCell className="font-medium">
                                      <Link to={`/profile/${staff.id}`} className="hover:opacity-80 transition-opacity">
                                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{staff.name}</span>
                                      </Link>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{staff.email}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${staff.role === 'HOD' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>{staff.role}</span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700">{getAssignedCourses(staff.id)}</span>
                                    </TableCell>
                                    <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <DotsHorizontalIcon className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedStaff(staff); setSelectedCourse(''); setIsAssignDialogOpen(true); }}>
                                                <PencilIcon className="w-4 h-4 mr-2" />Assign Course
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpenIcon className="w-5 h-5 text-indigo-500" />
                        Department Courses
                    </CardTitle>
                    <span className="text-sm text-slate-500">{unassignedCourses.length} unassigned</span>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Credits</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deptCourses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                            No courses found. Create one using the button above.
                                        </TableCell>
                                    </TableRow>
                                ) : deptCourses.map((course: Course) => (
                                    <TableRow key={course.id}>
                                        <TableCell>
                                            <span className="px-2 py-1 text-xs font-mono font-bold rounded-md bg-indigo-50 text-indigo-700">{course.code}</span>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-800">{course.name}</TableCell>
                                        <TableCell>{course.credits}</TableCell>
                                        <TableCell>Sem {course.semester}</TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-700">{course.staffId ? getStaffName(course.staffId) : '—'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.staffId ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {course.staffId ? 'Assigned' : 'Unassigned'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Assign Course Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Course to {selectedStaff?.name}</DialogTitle>
                        <DialogDescription>
                            Select a course from your department to assign to this staff member.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-0 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Department Courses</label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deptCourses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            <span className="font-mono text-indigo-600 mr-2">{course.code}</span>
                                            {course.name}
                                            {!course.staffId && <span className="ml-2 text-xs text-amber-600">(unassigned)</span>}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedCourse && (() => {
                            const course = deptCourses.find(c => c.id === selectedCourse);
                            if (course?.staffId) {
                                return (
                                    <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                        ⚠️ This course is currently assigned to <strong>{getStaffName(course.staffId)}</strong>. Assigning it will reassign it.
                                    </p>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignCourse} disabled={!selectedCourse}>Assign Course</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Course Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Course</DialogTitle>
                        <DialogDescription>
                            Add a new course to your department. You can assign it to staff later.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-700">Course Name</label>
                                <input
                                    type="text"
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Data Structures and Algorithms"
                                    className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Course Code</label>
                                <input
                                    type="text"
                                    value={newCourse.code}
                                    onChange={(e) => setNewCourse(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. CS301"
                                    className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Credits</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={6}
                                    value={newCourse.credits}
                                    onChange={(e) => setNewCourse(p => ({ ...p, credits: Number(e.target.value) }))}
                                    className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-700">Semester</label>
                                <Select value={String(newCourse.semester)} onValueChange={(v) => setNewCourse(p => ({ ...p, semester: Number(v) }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCourse} disabled={!newCourse.name || !newCourse.code}>Create Course</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StaffManagement;