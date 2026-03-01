import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sessionApi from '@/services/sessionApi';

export const useSessions = (params = {}) => {
    return useQuery({
        queryKey: ['sessions', params],
        queryFn: () => sessionApi.getSessions(params),
    });
};

export const useSession = (ulid) => {
    return useQuery({
        queryKey: ['session', ulid],
        queryFn: () => sessionApi.getSession(ulid),
        enabled: !!ulid,
    });
};

export const useCreateSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sessionApi.createSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useEndSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sessionApi.endSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useDashboard = () => {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: sessionApi.getDashboard,
    });
};
