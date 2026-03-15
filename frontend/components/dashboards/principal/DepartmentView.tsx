import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { CLASSES } from '../../../constants';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectAllDepartments } from '../../../store/slices/appSlice';
import { UserRole, Department, User, Student } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, UserIcon, AcademicCapIcon, ChevronLeftIcon } from '../../icons/Icons';
import Button from '../../ui/Button';
// FIX: Import BreadcrumbItem type to fix type inference issues.
import Breadcrumb, { BreadcrumbItem } from '../../ui/Breadcrumb';

// Unchanged component
const DepartmentGrid: React.FC<{ departments: Department[], users: User[], onSelect: (dept: Department) => void }> = ({ departments, users, onSelect }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
            const hod = users.find(u => u.role === UserRole.HOD && u.departmentId === dept.id);
            const studentCount = users.filter(s => s.departmentId === dept.id && s.role === UserRole.STUDENT).length;
            const staffCount = users.filter(s => s.departmentId === dept.id && (s.role === UserRole.STAFF || s.role === UserRole.HOD)).length;
            return (
                <motion.div key={dept.id} onClick={() => onSelect(dept)} whileHover={{ y: -5 }} className="cursor-pointer">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{dept.name}</CardTitle>
                            <p className="text-sm text-gray-500">HOD: {hod?.name || 'Not Assigned'}</p>
                        </CardHeader>
                        <CardContent className="flex justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold">{studentCount}</p>
                                <p className="text-xs text-gray-500">Students</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{staffCount}</p>
                                <p className="text-xs text-gray-500">Staff</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )
        })}
    </div>
);

// New component for showing class details
const ClassDetailView: React.FC<{
    department: Department;
    year: number;
    users: User[];
}> = ({ department, year, users }) => {
    const hod = users.find(u => u.role === UserRole.HOD && u.departmentId === department.id);
    const classInfo = CLASSES.find(c => c.departmentId === department.id && c.year === year);
    const advisor = classInfo ? users.find(u => u.id === classInfo.advisorId) : null;
    const studentsInClass = users.filter(s => s.role === UserRole.STUDENT && s.departmentId === department.id && (s as Student).year === year);
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Leadership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                            <AcademicCapIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Head of Department</p>
                            <p className="font-semibold">{hod?.name || 'Not Assigned'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm flex-shrink-0">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Class Advisor</p>
                            <p className="font-semibold">{advisor?.name || 'Not Assigned'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Students ({studentsInClass.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="responsive-columns space-y-2">
                        {studentsInClass.map(student => (
                            <li key={student.id} className="text-sm break-inside-avoid">
                                <Link to={`/profile/${student.id}`} className="text-indigo-600 hover:underline">
                                    {student.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

// Modified component to show year-wise classes
const DepartmentDetail: React.FC<{ department: Department, users: User[], onSelectYear: (year: number) => void }> = ({ department, users, onSelectYear }) => {
    const studentsInDept = users.filter(s => s.role === UserRole.STUDENT && s.departmentId === department.id);
    const years = Array.from(new Set<number>(studentsInDept.map(s => (s as Student).year))).sort((a, b) => a - b);

    const getYearText = (year: number) => {
        switch (year) {
            case 2: return '2nd Year';
            case 3: return '3rd Year';
            case 4: return 'Final Year';
            default: return `${year}st Year`;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Year-wise Classes</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {years.map(year => (
                            <div
                                key={year}
                                onClick={() => onSelectYear(year)}
                                className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <p className="font-semibold text-gray-800">{getYearText(year)}</p>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        ))}
                         {years.length === 0 && (
                            <p className="text-sm text-center text-gray-500 py-4">No active classes found in this department.</p>
                         )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Main component with state machine logic
const DepartmentView: React.FC = () => {
    const departments = useSelector(selectAllDepartments);
    const users = useSelector(selectAllUsers);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const handleSelectDepartment = (dept: Department) => {
        setSelectedDepartment(dept);
        setSelectedYear(null);
    };

    const handleBackToGrid = () => {
        setSelectedDepartment(null);
        setSelectedYear(null);
    };

    const handleBackToDept = () => {
        setSelectedYear(null);
    };
    
    const getYearText = (year: number | null) => {
        if (!year) return '';
        switch (year) {
            case 2: return '2nd Year';
            case 3: return '3rd Year';
            case 4: return 'Final Year';
            default: return `${year}st Year`;
        }
    };

    const getViewKey = () => {
        if (selectedDepartment && selectedYear) return `class-${selectedYear}`;
        if (selectedDepartment) return `dept-${selectedDepartment.id}`;
        return 'grid';
    };

    const breadcrumbItems = React.useMemo(() => {
        // FIX: Explicitly type `items` array and simplify logic to make last item unclickable.
        const items: BreadcrumbItem[] = [{ label: 'Departments', onClick: handleBackToGrid }];
        if (selectedDepartment) {
            items.push({ label: selectedDepartment.name, onClick: handleBackToDept });
        }
        if (selectedYear) {
            items.push({ label: getYearText(selectedYear) });
        }

        // The last item shouldn't be clickable.
        if (items.length > 0) {
            items[items.length - 1].onClick = undefined;
        }

        return items;
    }, [selectedDepartment, selectedYear]);

    return (
        <div className="space-y-4">
             <h1 className="text-3xl font-bold">Departments</h1>
             <Breadcrumb items={breadcrumbItems} />
             <AnimatePresence mode="wait">
                <motion.div
                    key={getViewKey()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {!selectedDepartment ? (
                        <DepartmentGrid departments={departments} users={users} onSelect={handleSelectDepartment} />
                    ) : !selectedYear ? (
                        <DepartmentDetail department={selectedDepartment} users={users} onSelectYear={setSelectedYear} />
                    ) : (
                        <ClassDetailView department={selectedDepartment} year={selectedYear} users={users} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default DepartmentView;
