export const getBaseUrl = () => {
    if (import.meta.env.VITE_BASE_URL) return import.meta.env.VITE_BASE_URL;
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Local dev detection
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
            return 'http://localhost:5000';
        }
    }
    // New Render backend fallback
    return 'https://nit-campuz-backend.onrender.com';
};

export const BASE_URL = getBaseUrl();
