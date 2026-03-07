import { useQuery } from '@tanstack/react-query';
import * as reportApi from '@/services/reportApi';

export const useMentorReport = (params) => {
    return useQuery({
        queryKey: ['reports', 'mentor', params],
        queryFn: () => reportApi.getMentorReport(params),
        enabled: !!params?.start && !!params?.end,
    });
};

export const useAdminReport = (params) => {
    return useQuery({
        queryKey: ['reports', 'admin', params],
        queryFn: () => reportApi.getAdminReport(params),
        enabled: !!params?.start && !!params?.end,
    });
};

export const useMenteeReport = (params) => {
    return useQuery({
        queryKey: ['reports', 'mentee', params],
        queryFn: () => reportApi.getMenteeReport(params),
        enabled: !!params?.start && !!params?.end,
    });
};
