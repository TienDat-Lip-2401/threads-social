import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getCurrentUser } from '@/services/auth';
import {
    selectAuthError,
    selectAuthLoading,
    selectIsAuthenticated,
    selectCurrentUser,
} from './authSelector';

/**
 * 🔄 Hook để fetch user info khi app mount
 * - Chỉ gọi API nếu có token trong localStorage
 * - Tránh unnecessary 401 errors
 */
export const useFetchCurrentUser = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getCurrentUser());
    }, [dispatch]);
};

// 👤 Hook để lấy user info từ Redux store
export const useCurrentUser = () => useSelector(selectCurrentUser);

// 🔐 Hook để check authentication status
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);

//  🔐 Hook để check authentication status
export const useAuthLoading = () => useSelector(selectAuthLoading);

export const useAuthError = () => useSelector(selectAuthError);
