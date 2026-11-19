import { createSlice } from '@reduxjs/toolkit';

import { toggleFollow } from '@/services/users';
import { logout } from '@/features/auth';

// Chỉ lưu trạng thái theo dõi đã đổi trong phiên này (ghi đè dữ liệu từ API):
// byUserId[userId] = { isFollowing, followersCount }. Chưa có → dùng is_following từ bài / hồ sơ.
const initialState = { byUserId: {} };

const set = (state, userId, isFollowing, followersCount) => {
    state.byUserId[userId] = { isFollowing, followersCount };
};

const followsSlice = createSlice({
    name: 'follows',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(toggleFollow.pending, (state, action) => {
                const { userId, isFollowing, followersCount } = action.meta.arg;
                const next = !isFollowing;
                set(
                    state,
                    userId,
                    next,
                    followersCount == null
                        ? null
                        : Math.max(0, followersCount + (next ? 1 : -1)),
                );
            })
            .addCase(toggleFollow.fulfilled, (state, action) => {
                const { is_following, followers_count } = action.payload;
                set(
                    state,
                    action.meta.arg.userId,
                    is_following,
                    followers_count,
                );
            })
            .addCase(toggleFollow.rejected, (state, action) => {
                const { userId, isFollowing, followersCount } = action.meta.arg;
                set(state, userId, isFollowing, followersCount ?? null);
            })
            // Đăng xuất → bỏ trạng thái của tài khoản cũ
            .addCase(logout, () => initialState);
    },
});

export default followsSlice.reducer;
