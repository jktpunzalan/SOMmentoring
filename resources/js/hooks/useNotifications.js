import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '@/services/notificationApi';

export const useNotifications = (params = {}) => {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationApi.getNotifications(params),
        refetchInterval: 30000,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
