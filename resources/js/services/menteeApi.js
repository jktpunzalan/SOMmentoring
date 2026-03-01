import api from './axios';

export const getMentees = async () => {
    const response = await api.get('/mentees');
    return response.data;
};

export const getPendingMentees = async () => {
    const response = await api.get('/mentees/pending');
    return response.data;
};

export const approveMentee = async (id) => {
    const response = await api.post(`/mentees/${id}/approve`);
    return response.data;
};

export const rejectMentee = async (id, reason) => {
    const response = await api.post(`/mentees/${id}/reject`, { rejection_reason: reason });
    return response.data;
};
