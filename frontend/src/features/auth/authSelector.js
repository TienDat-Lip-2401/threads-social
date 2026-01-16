// ============================================
// 🎯 SELECTORS
// ============================================
export const selectCurrentUser = (state) => state.auth.userInfo;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectAuthLoading = (state) => state.auth.isLoading;

export const selectAuthError = (state) => state.auth.error;
