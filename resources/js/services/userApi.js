import api from './axios';

export const getUsers = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

export const createUser = async (data) => {
    const response = await api.post('/users', data);
    return response.data;
};

export const updateUser = async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

export const resetUserPassword = async (id, password) => {
    const response = await api.post(`/users/${id}/reset-password`, { password });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data;
};

export const updateProfile = async (data) => {
    const isFormData = data instanceof FormData;
    const request = isFormData
        ? api.post('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        : api.put('/profile', data);

    const response = await request;
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
