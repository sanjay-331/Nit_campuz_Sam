
import React, { useState } from 'react';
import { BellIcon, CheckCircleIcon } from '../icons/Icons';
import Button from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { NOTIFICATIONS } from '../../constants';
import { Notification } from '../../types';

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
    };

    const getIconForType = (type: Notification['type']) => {
        switch(type) {
            case 'Approval': return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
            case 'Alert': return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>;
            case 'Action': return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="!p-2.5 relative" aria-label="Notifications">
                    <BellIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-xs font-normal text-gray-500">{unreadCount} Unread</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 5).map(n => (
                        <DropdownMenuItem key={n.id} className={`items-start ${!n.read ? 'bg-blue-50' : ''}`} onSelect={(e) => e.preventDefault()}>
                            <div className="flex-shrink-0 mt-1.5 mr-3">{getIconForType(n.type)}</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 whitespace-normal">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
                            </div>
                            {!n.read && (
                                <Button variant="ghost" size="sm" className="!p-1 h-auto" onClick={() => handleMarkAsRead(n.id)}>
                                    <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                                </Button>
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem className="justify-center">
                    View All Notifications
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;
