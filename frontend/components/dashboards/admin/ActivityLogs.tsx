
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { ACTIVITY_LOGS } from '../../../constants';
import { UploadIcon } from '../../icons/Icons';
import Button from '../../ui/Button';

const ActivityLogs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = ACTIVITY_LOGS.filter(log => 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Activity Logs</h1>
                <p className="text-slate-600">Track recent activities across the system.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>System Log Stream</CardTitle>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-48 px-3 py-1.5 text-sm bg-gray-100 rounded-lg border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                             <Button variant="secondary" size="sm" leftIcon={<UploadIcon className="w-4 h-4" />}>
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold">
                                    {log.user.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{log.action}</p>
                                    <p className="text-xs text-gray-500">
                                        by <span className="font-semibold">{log.user}</span> on {log.timestamp}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        IP: {log.ipAddress} &bull; Browser: {log.browser}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivityLogs;