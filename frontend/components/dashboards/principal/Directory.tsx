import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { User, UserRole, StudentStatus } from '../../../types';
import { Input } from '../../ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Skeleton } from '../../ui/Skeleton';
import EmptyState from '../../shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/Tabs";
import { useDebounce } from '../../../hooks/useDebounce';
import { Link } from 'react-router-dom';

const Directory: React.FC = () => {
    const users = useSelector(selectAllUsers);
    const DEPARTMENTS = useSelector(selectAllDepartments);
    const STAFF = users.filter((u: User) => u.role === UserRole.STAFF || u.role === UserRole.HOD);
    const STUDENTS = users.filter((u: User) => u.role === UserRole.STUDENT && (u as any).status !== StudentStatus.ALUMNI);

    const [loading, setLoading] = useState(true);
    
    // State for the actual input values
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Debounce the search term to improve performance
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }, []);

    const filterUsers = (users: User[], departmentId: string, query: string) => {
        return users.filter(user => {
            const deptMatch = departmentId ? user.departmentId === departmentId : true;
            const searchMatch = query ? 
                user.name.toLowerCase().includes(query.toLowerCase()) || 
                user.email.toLowerCase().includes(query.toLowerCase()) : true;
            return deptMatch && searchMatch;
        });
    }
    
    const filteredStaff = useMemo(() => {
         return filterUsers(STAFF, departmentFilter, debouncedSearchTerm);
    }, [departmentFilter, debouncedSearchTerm]);
    
    const filteredStudents = useMemo(() => {
         return filterUsers(STUDENTS, departmentFilter, debouncedSearchTerm);
    }, [departmentFilter, debouncedSearchTerm]);

    const renderTable = (data: User[], type: 'staff' | 'student') => (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Department</TableHead>
                  {type === 'student' && <TableHead>Year</TableHead>}
                  {type === 'staff' && <TableHead>Role</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                        <Link to={`/profile/${user.id}`} className="hover:opacity-80 transition-opacity">
                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{user.name}</span>
                        </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{user.email}</span>
                    </TableCell>
                    <TableCell>
                        <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{DEPARTMENTS.find(d => d.id === user.departmentId)?.name || 'N/A'}</span>
                    </TableCell>
                    {type === 'student' && 'year' in user && (
                      <TableCell>
                          <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{(user as any).year}</span>
                      </TableCell>
                    )}
                    {type === 'staff' && (
                      <TableCell>
                          <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">{user.role}</span>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.length === 0 && <EmptyState title={`No ${type} found`} message="Try adjusting your filters." />}
        </CardContent>
      </Card>
    );

    const renderSkeleton = () => (
        <Card>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Directory</h1>
                <p className="text-gray-500">View all staff and students in the institution.</p>
            </div>

            <Card className="overflow-visible">
                <CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            placeholder="Search by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select onValueChange={setDepartmentFilter} value={departmentFilter}>
                            <SelectTrigger><SelectValue placeholder="Filter by department..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Departments</SelectItem>
                                {DEPARTMENTS.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="staff" className="w-full">
                <TabsList>
                    <TabsTrigger value="staff">Staff ({filteredStaff.length})</TabsTrigger>
                    <TabsTrigger value="students">Students ({filteredStudents.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="staff">
                    {loading ? renderSkeleton() : renderTable(filteredStaff, 'staff')}
                </TabsContent>
                <TabsContent value="students">
                     {loading ? renderSkeleton() : renderTable(filteredStudents, 'student')}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Directory;