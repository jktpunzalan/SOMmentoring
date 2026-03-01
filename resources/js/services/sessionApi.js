import api from './axios';

export const getSessions = async (params = {}) => {
    const response = await api.get('/sessions', { params });
    return response.data;
};

export const getSession = async (ulid) => {
    const response = await api.get(`/sessions/${ulid}`);
    return response.data;
};

export const createSession = async (data) => {
    const response = await api.post('/sessions', data);
    return response.data;
};

export const endSession = async (ulid) => {
    const response = await api.post(`/sessions/${ulid}/end`);
    return response.data;
};

export const getDashboard = async () => {
    const response = await api.get('/dashboard');
    return response.data;
};
