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

api.interceptors.request.use((config) => {
    const hasXsrfCookie = typeof document !== 'undefined' && document.cookie?.includes('XSRF-TOKEN=');
    if (!hasXsrfCookie) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            config.headers = config.headers || {};
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Do not force hard page navigations on 401.
        // Let the app's auth state + React Router handle redirects.
        return Promise.reject(error);
    }
);

export const getCsrfCookie = () => axios.get('/sanctum/csrf-cookie', { withCredentials: true });

export default api;
