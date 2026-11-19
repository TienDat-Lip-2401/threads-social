import { createAsyncThunk } from '@reduxjs/toolkit';

import http from '@/utils/http';

// GET users/{username} → hồ sơ công khai (kèm is_me nếu đang đăng nhập)
export const getUserProfile = async (username) => {
    const response = await http.get(`users/${encodeURIComponent(username)}`);
    return response.data;
};

// PUT auth/user (multipart: name, bio, avatar) → thông tin user sau khi sửa
export const updateProfile = async ({ name, bio, avatar }) => {
    const formData = new FormData();
    formData.append('name', name ?? '');
    formData.append('bio', bio ?? '');
    if (avatar) formData.append('avatar', avatar);

    const response = await http.put('auth/user', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// POST users/{username}/follow → { is_following, followers_count }
// arg: { userId, username, isFollowing, followersCount } = trạng thái TRƯỚC khi bấm
// (followsSlice đổi UI ngay ở pending, đồng bộ server ở fulfilled, trả lại ở rejected)
export const toggleFollow = createAsyncThunk(
    'follows/toggle',
    async ({ username }, { rejectWithValue }) => {
        try {
            const response = await http.post(
                `users/${encodeURIComponent(username)}/follow`,
            );
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);
