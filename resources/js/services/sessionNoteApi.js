import api from './axios';

export const getSessionNotes = async (sessionUlid) => {
    const response = await api.get(`/sessions/${sessionUlid}/notes`);
    return response.data;
};

export const saveSessionNotes = async (sessionUlid, data) => {
    const response = await api.post(`/sessions/${sessionUlid}/notes`, data);
    return response.data;
};

export const updateSessionNotes = async (sessionUlid, data) => {
    const response = await api.put(`/sessions/${sessionUlid}/notes`, data);
    return response.data;
};
