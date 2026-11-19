import { createAsyncThunk } from '@reduxjs/toolkit';

import http from '@/utils/http';

// 👤 Fetch thông tin user hiện tại
export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await http.get('auth/user');
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message:
                    error?.message ||
                    'Failed to fetch user info. Please try again',
                status: error.response?.status || error?.status,
            });
        }
    },
);

export const loginUser = async (credentials) => {
    const response = await http.post('auth/login', credentials);
    return response.data;
};

export const registerUser = async (credentials) => {
    const response = await http.post('auth/register', credentials);
    return response.data;
};

export const logoutUser = async () => {
    const response = await http.post('auth/logout');
    return response.data;
};

export const verifyEmail = async (token) => {
    const response = await http.post('auth/verify-email', { token });
    return response.data;
};

// Không cần đăng nhập: user chưa xác thực email thì chưa đăng nhập được
export const resendVerificationEmail = async (email) => {
    const response = await http.post('auth/resend-verification-email', {
        email,
    });

    return response;
};

export const forgotPassword = async (email) => {
    const response = await http.post('auth/forgot-password', email);
    console.log(response);

    return response;
};

export const resetPassword = async ({
    token,
    email,
    password,
    passwordConfirmation,
}) => {
    const response = await http.post('auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
    });

    return response;
};
