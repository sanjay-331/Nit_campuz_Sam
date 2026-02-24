import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';

const mockResources = [
    { id: 'res1', name: 'Classroom 301', type: 'Classroom', status: 'Allocated', details: 'CS201 - Data Structures (9-11 AM)' },
    { id: 'res2', name: 'Classroom 302', type: 'Classroom', status: 'Available', details: 'Free until 2 PM' },
    { id: 'res3', name: 'Computer Lab 1', type: 'Lab', status: 'Allocated', details: 'CS301 - Algorithms Lab (1-4 PM)' },
    { id: 'res4', name: 'Project Lab', type: 'Lab', status: 'Available', details: 'Open for final year projects' },
    { id: 'res5', name: 'Seminar Hall A', type: 'Hall', status: 'Booked', details: 'Guest Lecture (11 AM - 1 PM)' },
];

const Resources: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Resource Management</h1>
                <p className="text-slate-600">Allocate and manage departmental resources like classrooms and labs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockResources.map(resource => (
                    <Card key={resource.id}>
                        <CardHeader>
                            <CardTitle>{resource.name}</CardTitle>
                             <p className={`text-sm font-medium ${resource.status === 'Available' ? 'text-green-600' : 'text-orange-600'}`}>{resource.status}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4 h-10">{resource.details}</p>
                            <Button size="sm" variant="secondary" className="w-full">
                                {resource.status === 'Available' ? 'Allocate' : 'View Schedule'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Resources;