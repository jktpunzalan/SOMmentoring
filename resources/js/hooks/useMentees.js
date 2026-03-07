import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as menteeApi from '@/services/menteeApi';

export const useMentees = () => {
    return useQuery({
        queryKey: ['mentees'],
        queryFn: menteeApi.getMentees,
    });
};

export const usePendingMentees = () => {
    return useQuery({
        queryKey: ['mentees', 'pending'],
        queryFn: menteeApi.getPendingMentees,
    });
};

export const useMenteeDetail = (id) => {
    return useQuery({
        queryKey: ['mentees', 'detail', id],
        queryFn: () => menteeApi.getMenteeDetail(id),
        enabled: !!id,
    });
};

export const useApproveMentee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: menteeApi.approveMentee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useRejectMentee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }) => menteeApi.rejectMentee(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
