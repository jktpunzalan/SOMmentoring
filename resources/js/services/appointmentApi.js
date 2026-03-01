import api from './axios';

export const getAppointments = async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
};

export const getAppointment = async (ulid) => {
    const response = await api.get(`/appointments/${ulid}`);
    return response.data;
};

export const createAppointment = async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
};

export const updateAppointment = async (ulid, data) => {
    const response = await api.put(`/appointments/${ulid}`, data);
    return response.data;
};

export const getAvailableSlots = async () => {
    const response = await api.get('/appointments/available');
    return response.data;
};

export const enrollAppointment = async (ulid) => {
    const response = await api.post(`/appointments/${ulid}/enroll`);
    return response.data;
};

export const unenrollAppointment = async (ulid) => {
    const response = await api.post(`/appointments/${ulid}/unenroll`);
    return response.data;
};

export const approveMentee = async (ulid, menteeId) => {
    const response = await api.post(`/appointments/${ulid}/mentees/${menteeId}/approve`);
    return response.data;
};

export const rejectMentee = async (ulid, menteeId) => {
    const response = await api.post(`/appointments/${ulid}/mentees/${menteeId}/reject`);
    return response.data;
};

export const approveAppointment = async (ulid) => {
    const response = await api.post(`/appointments/${ulid}/approve`);
    return response.data;
};

export const rejectAppointment = async (ulid, reason) => {
    const response = await api.post(`/appointments/${ulid}/reject`, { rejection_reason: reason });
    return response.data;
};

export const cancelAppointment = async (ulid) => {
    const response = await api.post(`/appointments/${ulid}/cancel`);
    return response.data;
};

export const getCalendarData = async (params = {}) => {
    const response = await api.get('/appointments/calendar', { params });
    return response.data;
};
