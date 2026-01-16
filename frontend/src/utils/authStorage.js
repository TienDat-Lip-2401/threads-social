/**
 * 💾 Utility functions để quản lý authentication data trong localStorage
 *
 * Bao gồm:
 * - Tokens (access_token, refresh_token)
 * - User Profile
 */

// ============================================
// 🔐 TOKEN MANAGEMENT
// ============================================
export const saveLocalAccessToken = (token) =>
    localStorage.setItem('access_token', token);

export const saveLocalRefreshToken = (token) =>
    localStorage.setItem('refresh_token', token);

export const getLocalAccessToken = () => localStorage.getItem('access_token');

export const getLocalRefreshToken = () => localStorage.getItem('refresh_token');

export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// ============================================
// 👤 USER PROFILE MANAGEMENT
// ============================================
export const saveUserInfoToLS = (userInfo) =>
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

export const getCurrentUserFromLS = () => {
    const result = localStorage.getItem('userInfo');
    return result ? JSON.parse(result) : null;
};

export const clearUserInfo = () => {
    localStorage.removeItem('userInfo');
};
