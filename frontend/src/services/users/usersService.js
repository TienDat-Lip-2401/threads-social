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
