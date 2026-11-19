import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toggleFollow } from '@/services/users';

// Trạng thái theo dõi 1 user: ưu tiên giá trị đã đổi trong phiên, không có thì dùng dữ liệu API
// fallback: { isFollowing, followersCount } từ bài viết / hồ sơ
export const useFollowState = (userId, fallback) => {
    const override = useSelector((state) => state.follows.byUserId[userId]);
    return {
        isFollowing: override
            ? override.isFollowing
            : Boolean(fallback?.isFollowing),
        followersCount:
            override?.followersCount ?? fallback?.followersCount ?? null,
    };
};

// Trả hàm bật/tắt theo dõi (truyền trạng thái hiện tại để cập nhật UI ngay)
export const useToggleFollow = () => {
    const dispatch = useDispatch();
    return useCallback(
        ({ userId, username, isFollowing, followersCount = null }) =>
            dispatch(
                toggleFollow({ userId, username, isFollowing, followersCount }),
            ),
        [dispatch],
    );
};
