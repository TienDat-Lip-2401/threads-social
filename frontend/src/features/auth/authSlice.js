import { createSlice } from '@reduxjs/toolkit';

import { getCurrentUser } from '@/services/auth';
import { clearTokens } from '@/utils/authStorage';

const initialState = {
    isAuthenticated: false,
    userInfo: null,
    isLoading: false,
    error: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: () => {
            clearTokens();
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.userInfo = action.payload;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;

                // Chỉ logout user khi token không hợp lệ (401) hoặc không có quyền (403)
                // Các lỗi khác (500, network...) không ảnh hưởng đến authentication
                if (
                    action.payload?.status === 401 ||
                    action.payload.status === 403
                ) {
                    state.isAuthenticated = false;
                    state.userInfo = null;
                }
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
