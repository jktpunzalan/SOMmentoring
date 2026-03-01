import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sessionNoteApi from '@/services/sessionNoteApi';

export const useSessionNotes = (sessionUlid) => {
    return useQuery({
        queryKey: ['sessionNotes', sessionUlid],
        queryFn: () => sessionNoteApi.getSessionNotes(sessionUlid),
        enabled: !!sessionUlid,
    });
};

export const useSaveSessionNotes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sessionUlid, data }) => sessionNoteApi.saveSessionNotes(sessionUlid, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sessionNotes', variables.sessionUlid] });
            queryClient.invalidateQueries({ queryKey: ['session', variables.sessionUlid] });
        },
    });
};

export const useUpdateSessionNotes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sessionUlid, data }) => sessionNoteApi.updateSessionNotes(sessionUlid, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sessionNotes', variables.sessionUlid] });
            queryClient.invalidateQueries({ queryKey: ['session', variables.sessionUlid] });
        },
    });
};
