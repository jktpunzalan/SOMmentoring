import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const path = window.location.pathname;
            const isGuestRoute = path === '/login' || path === '/register' || path === '/pending-approval';
            const requestUrl = error.config?.url || '';
            const isAuthMeRequest = requestUrl.includes('/auth/me');

            if (!isGuestRoute && !isAuthMeRequest) {
                const redirectedAt = Number(sessionStorage.getItem('auth_redirected_at') || '0');
                const now = Date.now();
                if (!redirectedAt || now - redirectedAt > 2000) {
                    sessionStorage.setItem('auth_redirected_at', String(now));
                    window.location.assign('/login');
                }
            }
        }
        return Promise.reject(error);
    }
);

export const getCsrfCookie = () => axios.get('/sanctum/csrf-cookie', { withCredentials: true });

export default api;
