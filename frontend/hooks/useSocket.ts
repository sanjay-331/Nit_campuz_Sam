import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';
import { addNotification } from '../store/slices/appSlice';

const SOCKET_URL = 'https://nitcampuz-production.up.railway.app'; // Fixed production URL

let socket: Socket | null = null;

export const useSocket = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    useEffect(() => {
        if (isAuthenticated && user && !socket) {
            socket = io(SOCKET_URL, {
                // Ensure auth token or credentials could be passed here if needed
            });

            socket.on('connect', () => {
                console.log('Connected to WebSocket server:', socket?.id);
                // Join personal room for targeted alerts (if supported by backend)
                const currentUser = user as any; 
                if (currentUser && currentUser.id) {
                    socket?.emit('join_user_room', currentUser.id);
                }
            });

            // Listen for global or departmental push notifications
            socket.on('notification', (data: { type: any, message: string, courseId?: string }) => {
                const newNotification = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: data.type || 'Alert',
                    message: data.message,
                    timestamp: new Date().toLocaleTimeString(),
                    read: false
                };
                
                dispatch(addNotification(newNotification));
                dispatch(showToast({ type: 'success', message: `[${data.type}] ${data.message}` }));
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from WebSocket server');
            });
        }

        // Cleanup on unmount or logout
        return () => {
            if (socket && (!isAuthenticated || !user)) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [isAuthenticated, user, dispatch]);

    return socket;
};
