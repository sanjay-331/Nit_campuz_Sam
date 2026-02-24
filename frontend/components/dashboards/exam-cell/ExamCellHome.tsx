
import React from 'react';
import StatCard from '../../dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { useSelector } from 'react-redux';
import { selectAllUsers, selectAllCourses } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student } from '../../../types';
import Button from '../../ui/Button';
import { LockClosedIcon, LockOpenIcon, UploadIcon, CalendarIcon } from '../../icons/Icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ExamCellHome: React.FC = () => {
  const users = useSelector(selectAllUsers);
  const COURSES = useSelector(selectAllCourses);
  const STUDENTS = React.useMemo(() => users.filter((u: any) => u.role === UserRole.STUDENT && u.status !== StudentStatus.ALUMNI) as Student[], [users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam Cell Dashboard</h1>
        <p className="text-gray-500">Manage examinations, results, and student academic records.</p>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}><StatCard title="Total Students" value={STUDENTS.length} /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Active Courses" value={COURSES.length} /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Pending Results" value={2} /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Link to="/results" className="w-full">
                  <Button className="w-full flex-col h-24" leftIcon={<UploadIcon className="w-5 h-5 mb-1" />}>Publish Results</Button>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button variant="secondary" className="w-full flex-col h-24" leftIcon={<LockClosedIcon className="w-5 h-5 mb-1" />}>Lock Results</Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button variant="secondary" className="w-full flex-col h-24" leftIcon={<LockOpenIcon className="w-5 h-5 mb-1" />}>Unlock Results</Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/schedules" className="w-full">
                  <Button variant="secondary" className="w-full flex-col h-24" leftIcon={<CalendarIcon className="w-5 h-5 mb-1" />}>Create Schedule</Button>
                </Link>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="text-sm p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="font-semibold text-blue-800">Ready for Verification:</span> Internal marks for CS301 uploaded by staff.
              </li>
              <li className="text-sm p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <span className="font-semibold text-yellow-800">Schedule Update:</span> ME202 exam has been rescheduled.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamCellHome;