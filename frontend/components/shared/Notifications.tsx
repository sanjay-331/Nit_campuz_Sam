import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { selectNotifications, markNotificationReadRequest } from '../../store/slices/appSlice';
import { Notification } from '../../types';

const Notifications: React.FC = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(selectNotifications);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        dispatch(markNotificationReadRequest(id));
    };

    const getIconForType = (type: Notification['type']) => {
        switch(type) {
            case 'Approval': return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
            case 'Alert': return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>;
            case 'Action': return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
            default: return <div className="w-2 h-2 rounded-full bg-slate-500"></div>;
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
                    {notifications.length > 0 ? (
                        notifications.slice(0, 8).map(n => (
                            <DropdownMenuItem key={n.id} className={`items-start ${!n.read ? 'bg-blue-50/50' : ''}`} onSelect={(e) => e.preventDefault()}>
                                <div className="flex-shrink-0 mt-1.5 mr-3">{getIconForType(n.type)}</div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700 whitespace-normal leading-relaxed">{n.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                                </div>
                                {!n.read && (
                                    <Button variant="ghost" size="sm" className="!p-1 h-auto hover:bg-white" onClick={() => handleMarkAsRead(n.id)}>
                                        <CheckCircleIcon className="w-4 h-4 text-slate-400" />
                                    </Button>
                                )}
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500 italic">No notifications</div>
                    )}
                </div>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem className="justify-center text-xs text-blue-600 font-medium">
                    View All Notifications
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;
