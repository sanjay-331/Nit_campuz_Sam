import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useSelector } from 'react-redux';
import { selectAllDepartments, selectAllUsers } from '../../../store/slices/appSlice';
import { UserRole, StudentStatus, Student } from '../../../types';
import { RootState } from '../../../store';
import Button from '../../ui/Button';
import { DownloadIcon, FileTextIcon, BarChartIcon, TableIcon } from '../../icons/Icons';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports: React.FC = () => {
    const departments = useSelector(selectAllDepartments);
    const users = useSelector(selectAllUsers);
    const odApplications = useSelector((state: RootState) => state.app.onDutyApplications) || [];
    
    const students = useMemo(() => 
        users.filter(u => u.role === UserRole.STUDENT && (u as any).status !== StudentStatus.ALUMNI) as Student[]
    , [users]);

    // Dynamic institutional stats
    const stats = useMemo(() => {
        const totalCgpa = students.reduce((acc, s) => acc + (s.cgpa || 0), 0);
        const avgCgpa = students.length > 0 ? (totalCgpa / students.length).toFixed(2) : '0.00';
        
        const totalWorking = students.reduce((acc, s) => acc + (s.totalWorkingDays || 0), 0);
        const totalPresent = students.reduce((acc, s) => acc + (s.daysPresent || 0), 0);
        const avgAttendance = totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(1) : '0.0';
        
        const approvedOD = odApplications.filter(a => a.status === 'Approved').length;
        const pendingOD = odApplications.filter(a => a.status.startsWith('Pending')).length;

        return { avgCgpa, avgAttendance, approvedOD, pendingOD };
    }, [students, odApplications]);

    const departmentData = useMemo(() => departments.map(dept => {
        const deptStudents = students.filter(s => s.departmentId === dept.id);
        const avgCgpa = deptStudents.length > 0 ? (deptStudents.reduce((acc, s) => acc + (s.cgpa || 0), 0) / deptStudents.length) : 0;
        const totalWorking = deptStudents.reduce((acc, s) => acc + (s.totalWorkingDays || 0), 0);
        const totalPresent = deptStudents.reduce((acc, s) => acc + (s.daysPresent || 0), 0);
        const avgAttendance = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;

        return {
            name: dept.name,
            students: deptStudents.length,
            avgCgpa: parseFloat(avgCgpa.toFixed(2)),
            attendance: parseFloat(avgAttendance.toFixed(1))
        };
    }), [departments, students]);

    const odStats = [
        { name: 'Approved', value: odApplications.filter(a => a.status === 'Approved').length },
        { name: 'Pending', value: odApplications.filter(a => a.status.startsWith('Pending')).length },
        { name: 'Rejected', value: odApplications.filter(a => a.status === 'Rejected').length },
    ].filter(s => s.value > 0);

    const fallbackODStats = odStats.length > 0 ? odStats : [{ name: 'No Applications', value: 1 }];

    const handleExport = (reportName: string) => {
        alert(`${reportName} export started. Data retrieved from live institutional records.`);
    };

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Analytics</h1>
                    <p className="text-slate-500 font-medium">Monitoring academic performance and attendance across <span className="text-indigo-600 font-bold">{departments.length} departments</span>.</p>
                </div>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 shadow-lg shadow-slate-200" leftIcon={<DownloadIcon className="w-4 h-4" />} onClick={() => handleExport('Institutional Master Report')}>
                    Generate Master Report
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Inst. CGPA', val: stats.avgCgpa, sub: 'Target: 8.50', color: 'bg-indigo-600', icon: <BarChartIcon className="w-5 h-5" /> },
                    { label: 'Inst. Attendance', val: `${stats.avgAttendance}%`, sub: 'Real-time average', color: 'bg-emerald-600', icon: <FileTextIcon className="w-5 h-5" /> },
                    { label: 'Total OD Approved', val: stats.approvedOD, sub: `${stats.pendingOD} Pending review`, color: 'bg-amber-600', icon: <TableIcon className="w-5 h-5" /> },
                    { label: 'Active Students', val: students.length, sub: 'Enrolled this sem', color: 'bg-rose-600', icon: <UserIcon className="w-5 h-5" /> },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className={`${s.color} text-white border-none shadow-xl shadow-${s.color.split('-')[1]}-100 overflow-hidden relative`}>
                            <div className="absolute -right-2 -bottom-2 opacity-10 scale-150">{s.icon}</div>
                            <CardContent className="p-6">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{s.label}</p>
                                <h3 className="text-3xl font-black mt-1">{s.val}</h3>
                                <p className="text-[10px] mt-4 font-bold opacity-70 flex items-center gap-1.5 italic">
                                    <ClockIcon className="w-3 h-3" /> {s.sub}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-slate-200 shadow-sm border-t-4 border-t-indigo-500">
                    <CardHeader>
                        <CardTitle className="text-lg font-black">Performance by Department</CardTitle>
                        <CardDescription className="text-xs font-medium">Comparison of Student Strength and average CGPA.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full mt-2">
                            <ResponsiveContainer>
                                <BarChart data={departmentData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="students" name="Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="avgCgpa" name="Avg CGPA" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="text-lg font-black">OD Status Distribution</CardTitle>
                        <CardDescription className="text-xs font-medium">Real-time breakdown of all duty-leave applications.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center justify-center p-6 pt-0">
                        <div className="h-64 w-64 relative">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={fallbackODStats}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {fallbackODStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-800">{odApplications.length}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 ml-0 sm:ml-8 mt-4 sm:mt-0">
                            {fallbackODStats.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <div>
                                        <p className="text-xs font-black text-slate-700 leading-none">{entry.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{entry.value} Applications</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
                    <CardHeader>
                        <CardTitle className="text-lg font-black">Average Attendance Analytics</CardTitle>
                        <CardDescription className="text-xs font-medium">Comparison of departmental attendance levels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full mt-2">
                            <ResponsiveContainer>
                                <BarChart data={departmentData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={120} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                                    <Bar dataKey="attendance" name="Attendance %" fill="#10b981" radius={[0, 6, 6, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm border-t-4 border-t-rose-500 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b py-4">
                        <CardTitle className="text-lg font-black">Institutional Data Exports</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 italic font-medium">
                            {[
                                { name: 'Full Semester Performance Report', type: 'Academic', size: '1.2 MB' },
                                { name: 'Faculty Load & Distribution', type: 'HR', size: '0.8 MB' },
                                { name: 'Consolidated Attendance Matrix', type: 'Attendance', size: '2.4 MB' },
                            ].map((report) => (
                                <div key={report.name} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-white group-hover:shadow-inner transition-all">
                                            <FileTextIcon className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{report.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 tracking-tight font-black uppercase">{report.type} • {report.size}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-10 w-10 !p-0 text-indigo-600 hover:bg-indigo-50 rounded-xl" onClick={() => handleExport(report.name)}>
                                        <DownloadIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
