import api from './axios';

export const getSessionPhotos = async (sessionUlid) => {
    const response = await api.get(`/sessions/${sessionUlid}/photos`);
    return response.data;
};

export const uploadSessionPhoto = async (sessionUlid, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post(`/sessions/${sessionUlid}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getPhotoDownloadUrl = (sessionUlid, photoId) => {
    return `/api/v1/sessions/${sessionUlid}/photos/${photoId}/download`;
};
