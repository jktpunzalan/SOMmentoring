import api, { getCsrfCookie } from './axios';

export const register = async (data) => {
    await getCsrfCookie();
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const login = async (credentials) => {
    await getCsrfCookie();
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const getMentors = async () => {
    const response = await api.get('/mentors');
    return response.data;
};
