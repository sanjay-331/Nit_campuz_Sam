import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/Dialog';
// FIX: Import the correct selectors and actions for the tutoring feature.
import { selectAllUsers, selectAllTutors, selectAllTutoringSessions, bookTutoringSessionRequest } from '../../../store/slices/appSlice';
import { selectUser } from '../../../store/slices/authSlice';
import { AppDispatch } from '../../../store';
// FIX: Import the missing Tutor and TutoringSession types.
import { User, Tutor, TutoringSession } from '../../../types';
import { SearchIcon, AcademicCapIcon, CalendarIcon } from '../../icons/Icons';
import EmptyState from '../../shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const PeerTutoring: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const allUsers = useSelector(selectAllUsers);
    const tutors = useSelector(selectAllTutors);
    const sessions = useSelector(selectAllTutoringSessions);

    const [searchTerm, setSearchTerm] = useState('');
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
    const [bookingDetails, setBookingDetails] = useState({ date: '', time: '' });

    const filteredTutors = useMemo(() => {
        return tutors.filter(tutor => {
            const student = allUsers.find(u => u.id === tutor.studentId);
            if (!student) return false;
            const searchMatch = searchTerm === '' || 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                tutor.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
            return searchMatch;
        });
    }, [tutors, allUsers, searchTerm]);
    
    const mySessions = useMemo(() => {
        if (!user) return [];
        return sessions.filter(s => s.studentId === user.id);
    }, [sessions, user]);

    const handleOpenBookingModal = (tutor: Tutor) => {
        setSelectedTutor(tutor);
        setBookingModalOpen(true);
    };

    const handleBookSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTutor || !user || !bookingDetails.date || !bookingDetails.time) return;

        dispatch(bookTutoringSessionRequest({
            tutorId: selectedTutor.id,
            studentId: user.id,
            subject: selectedTutor.subjects[0], // Defaulting to the first subject
            scheduledAt: new Date(`${bookingDetails.date}T${bookingDetails.time}`).toISOString(),
        }));
        
        setBookingModalOpen(false);
        setBookingDetails({ date: '', time: '' });
    };

    const TutorCard: React.FC<{ tutor: Tutor }> = ({ tutor }) => {
        const student = allUsers.find(u => u.id === tutor.studentId);
        if (!student) return null;

        return (
            <Card className="flex flex-col">
                <CardContent className="pt-6 flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                            {getInitials(student.name)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{student.name}</p>
                            <p className="text-sm text-yellow-600 font-semibold">{tutor.rating.toFixed(1)} ★</p>
                        </div>
                    </div>
                    <div className="space-y-1 mb-4">
                        <p className="text-sm font-medium text-gray-800">Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                            {tutor.subjects.map(sub => (
                                <span key={sub} className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">{sub}</span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 text-balance h-16">{tutor.bio}</p>
                </CardContent>
                <div className="p-4 bg-gray-50 rounded-b-2xl">
                    <Button size="sm" className="w-full" onClick={() => handleOpenBookingModal(tutor)}>Book Session</Button>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
                <DialogContent>
                    <form onSubmit={handleBookSession}>
                        <DialogHeader>
                            <DialogTitle>Book a session with {allUsers.find(u => u.id === selectedTutor?.studentId)?.name}</DialogTitle>
                            <DialogDescription>Select a date and time for your session.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 grid grid-cols-2 gap-4">
                           <Input type="date" value={bookingDetails.date} onChange={e => setBookingDetails(p => ({...p, date: e.target.value}))} required />
                           <Input type="time" value={bookingDetails.time} onChange={e => setBookingDetails(p => ({...p, time: e.target.value}))} required />
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" type="button" onClick={() => setBookingModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Request Session</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div>
                <h1 className="text-3xl font-bold">Peer Tutoring</h1>
                <p className="text-gray-500">Connect with peer tutors to get help with your courses.</p>
            </div>
            
            <Tabs defaultValue="find">
                 <TabsList>
                    <TabsTrigger value="find">Find a Tutor</TabsTrigger>
                    <TabsTrigger value="sessions">My Sessions ({mySessions.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="find">
                     <Card className="mt-4">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input 
                                    placeholder="Search by name or subject..."
                                    className="pl-11"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {filteredTutors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {filteredTutors.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)}
                        </div>
                    ) : (
                        <div className="mt-6">
                            <EmptyState title="No Tutors Found" message="Try adjusting your search. More tutors may be available soon." icon={<AcademicCapIcon className="w-12 h-12 text-gray-300" />} />
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="sessions">
                    <Card className="mt-4">
                        <CardContent className="pt-6">
                            {mySessions.length > 0 ? (
                                <ul className="space-y-3">
                                    {mySessions.map(session => {
                                        const tutorInfo = tutors.find(t => t.id === session.tutorId);
                                        const tutorUser = allUsers.find(u => u.id === tutorInfo?.studentId);
                                        return (
                                        <li key={session.id} className="p-4 flex items-center gap-4 border rounded-xl">
                                            <CalendarIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{session.subject} with {tutorUser?.name}</p>
                                                <p className="text-sm text-gray-500">{new Date(session.scheduledAt).toLocaleString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${session.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                                                {session.status}
                                            </span>
                                        </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <EmptyState title="No Sessions Booked" message="Find a tutor and book a session to get started." icon={<CalendarIcon className="w-12 h-12 text-gray-300" />} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PeerTutoring;
