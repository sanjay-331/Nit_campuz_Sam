import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DotsHorizontalIcon, PencilIcon, TrashIcon } from '../../icons/Icons';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectAllCourses } from '../../../store/slices/appSlice';
import { UserRole, Staff } from '../../../types';
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

const StaffManagement: React.FC = () => {
    const user = useSelector(selectUser);
    const users = useSelector(selectAllUsers);
    const COURSES = useSelector(selectAllCourses);

    const STAFF = useMemo(() => users.filter(u => u.role === UserRole.STAFF || u.role === UserRole.HOD) as Staff[], [users]);

    const deptStaff = useMemo(() => {
        return STAFF.filter(s => s.departmentId === user?.departmentId);
    }, [user, STAFF]);

    const getAssignedCourses = (staffId: string) => {
        return COURSES.filter(c => c.staffId === staffId).map(c => c.code).join(', ') || 'N/A';
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Staff Management</h1>
                <p className="text-slate-600">Manage staff members and their course assignments in your department.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Staff List</CardTitle>
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
                                {deptStaff.map(staff => (
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
                                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{getAssignedCourses(staff.id)}</span>
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
                                            <DropdownMenuItem><PencilIcon className="w-4 h-4 mr-2" />Assign Course</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50"><TrashIcon className="w-4 h-4 mr-2" />Remove Staff</DropdownMenuItem>
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
        </div>
    );
};

export default StaffManagement;