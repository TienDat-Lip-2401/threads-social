import { useCallback, useEffect, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { getPosts, loadMorePosts } from '@/services/posts';
import {
    selectAllPosts,
    selectHasMore,
    selectIsFetchingMore,
    selectIsInitialLoading,
    selectLikedPostIds,
    selectLikedPosts,
    selectMyPosts,
    selectProfilePosts,
    selectProfileReposts,
    selectRepostedPostIds,
    selectRepostedPosts,
} from './postsSelector';

// Với createAsyncThunk (Redux Toolkit)
// Just dispatch! API call happens automatically
export const useFetchPosts = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPosts());
    }, [dispatch]);
};

// ========================================
// 💡 Hook implement infinite scroll
// @returns {Object} - { observerRef, isFetchingMore }
// ========================================
export const useInfiniteScroll = () => {
    const dispatch = useDispatch();

    // 1. Lấy state từ Redux
    const hasMore = useHasMore();
    const isFetchingMore = useIsFetchingMore();
    const isInitialLoading = useInitialLoading();

    const observerRef = useRef(null);

    // Chỉ load more khi đủ 3 điều kiện::
    // 1. Không đang fetch thêm
    // 2. Còn data để load
    // 3. Không phải initial loading
    // auto load thêm post khi chạm đáy.
    const handleLoadMore = useCallback(() => {
        if (!isFetchingMore && hasMore && !isInitialLoading) {
            dispatch(loadMorePosts());
        }
    }, [dispatch, isFetchingMore, hasMore, isInitialLoading]);

    // IntersectionObserver: theo dõi khi một phần tử xuất hiện trong khung nhìn.
    // Dùng để tự động load thêm dữ liệu khi phần tử sentinel hiện ra.

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Khi sentinel element bắt đầu xuất hiện trong viewport → Load more
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            },
            {
                threshold: 0.1, // Trigger khi 10% chiều cao của sentinel đã vào tầm nhìn
                rootMargin: '100px', // Load trước 100px khi gần đến bottom. Tạo cảm giác mượt mà, không bị delay.
            },
        );

        // Gán observer vào phần tử thật → Bây giờ observer sẽ theo dõi phần tử <div ref={observerRef}>.
        const current = observerRef.current;
        if (current) {
            observer.observe(current);
        }

        // Cleanup khi unmount. Tránh memory leak hoặc duplicate observers
        return () => {
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [handleLoadMore]);

    return { observerRef, isFetchingMore };
};

// ========================================
// 💡 Hook để lấy interaction state của một post
// ========================================
const DEFAULT_INTERACTION = {
    isLiked: false,
    likeCount: 0,
    isReposted: false,
    repostCount: 0,
};

export const useInteraction = (postId) => {
    return useSelector((state) => {
        const { interactions, posts } = state.posts;

        // Case 1: User đã interact với post này → Dùng data từ interactions tracking (ưu tiên cao nhất)
        if (interactions[postId]) return interactions[postId];

        // Case 2: Post tồn tại nhưng user chưa interact → Dùng API data
        const post = posts.find((post) => post.id === postId);
        if (post) {
            return {
                isLiked: Boolean(post.is_liked),
                likeCount: post.likes_count,
                isReposted: Boolean(post.is_reposted),
                repostCount: post.reposts_and_quotes_count,
            };
        }

        // Case 3: Post không tồn tại → Return default để tránh crash
        return DEFAULT_INTERACTION;
    }, shallowEqual);
};

// ============================================
//  Hooks cho Liked Posts
// ============================================

export const useLikedPosts = () => useSelector(selectLikedPosts);

export const useLikedPostIds = () => useSelector(selectLikedPostIds);

// ============================================
//  Hooks cho Reposted Posts
// ============================================

export const useRepostedPosts = () => useSelector(selectRepostedPosts);

export const useRepostedPostIds = () => useSelector(selectRepostedPostIds);

export const useAllPosts = () => useSelector(selectAllPosts);

export const useHasMore = () => useSelector(selectHasMore);

export const useIsFetchingMore = () => useSelector(selectIsFetchingMore);

export const useInitialLoading = () => useSelector(selectIsInitialLoading);

export const useMyPosts = () => useSelector(selectMyPosts);
// { username, posts, currentPage, hasMore, isLoading } của trang hồ sơ
export const useProfilePosts = () => useSelector(selectProfilePosts);
// Cùng cấu trúc, cho tab Reposts của trang hồ sơ
export const useProfileReposts = () => useSelector(selectProfileReposts);
