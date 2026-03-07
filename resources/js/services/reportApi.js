import api from './axios';

export const getMentorReport = async (params) => {
    const response = await api.get('/reports/mentor', { params });
    return response.data;
};

export const getAdminReport = async (params) => {
    const response = await api.get('/reports/admin', { params });
    return response.data;
};

export const getMenteeReport = async (params) => {
    const response = await api.get('/reports/mentee', { params });
    return response.data;
};
