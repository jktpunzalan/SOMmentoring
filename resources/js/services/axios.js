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

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    api.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

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
