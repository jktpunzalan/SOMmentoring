import api from './axios';

export const getUsers = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data;
};

export const updateProfile = async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.put('/profile', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const getParticipants = async (sessionUlid) => {
    const response = await api.get(`/sessions/${sessionUlid}/participants`);
    return response.data;
};

export const updateParticipants = async (sessionUlid, menteeIds) => {
    const response = await api.post(`/sessions/${sessionUlid}/participants`, { mentee_ids: menteeIds });
    return response.data;
};
