import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as appointmentApi from '@/services/appointmentApi';

const invalidateAll = (queryClient) => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['appointment'] });
    queryClient.invalidateQueries({ queryKey: ['calendar'] });
    queryClient.invalidateQueries({ queryKey: ['available-slots'] });
};

export const useAppointments = (params = {}) => {
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => appointmentApi.getAppointments(params),
    });
};

export const useAppointment = (ulid) => {
    return useQuery({
        queryKey: ['appointment', ulid],
        queryFn: () => appointmentApi.getAppointment(ulid),
        enabled: !!ulid,
    });
};

export const useCalendarData = (params = {}) => {
    return useQuery({
        queryKey: ['calendar', params],
        queryFn: () => appointmentApi.getCalendarData(params),
    });
};

export const useAvailableSlots = (enabled = true) => {
    return useQuery({
        queryKey: ['available-slots'],
        queryFn: () => appointmentApi.getAvailableSlots(),
        enabled,
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.createAppointment,
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ulid, data }) => appointmentApi.updateAppointment(ulid, data),
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useEnrollAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.enrollAppointment,
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useUnenrollAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.unenrollAppointment,
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useApproveMentee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ulid, menteeId }) => appointmentApi.approveMentee(ulid, menteeId),
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useRejectMentee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ulid, menteeId }) => appointmentApi.rejectMentee(ulid, menteeId),
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useApproveAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.approveAppointment,
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useRejectAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ulid, reason }) => appointmentApi.rejectAppointment(ulid, reason),
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useCancelAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.cancelAppointment,
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useRemoveAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.removeAppointment,
        onSuccess: () => invalidateAll(queryClient),
    });
};

export const useRemoveMenteeFromAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ulid, menteeId }) => appointmentApi.removeMenteeFromAppointment(ulid, menteeId),
        onSuccess: () => invalidateAll(queryClient),
    });
};
