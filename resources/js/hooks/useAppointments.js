import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as appointmentApi from '@/services/appointmentApi';

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

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.createAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        },
    });
};

export const useApproveAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.approveAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        },
    });
};

export const useRejectAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ulid, reason }) => appointmentApi.rejectAppointment(ulid, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};

export const useCancelAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentApi.cancelAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        },
    });
};
