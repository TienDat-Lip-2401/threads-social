import { createSelector } from '@reduxjs/toolkit';

export const selectAllPosts = (state) => state.posts.posts;

export const selectIsInitialLoading = (state) => state.posts.isInitialLoading;

export const selectHasMore = (state) => state.posts.hasMore;

export const selectError = (state) => state.posts.error;

export const selectIsFetchingMore = (state) => state.posts.isFetchingMore;

// Memoized selector - Chỉ re-compute khi dependencies thay đổi
export const selectMyPosts = createSelector(
    [
        // Input selectors - Dependencies
        (state) => state.posts.posts, // Dependency 1: posts array
        (state) => state.auth.userInfo?.id, // Dependency 2: current user ID
    ],
    // Output selector - Computed value
    (posts, currentUserId) => {
        if (!currentUserId) return [];

        return posts.filter((post) => post.user.id === currentUserId);
    },
);

// ============================================
//  Selectors cho Liked Posts
// ============================================

export const selectLikedPostIds = (state) => state.posts.likedPostIds;

// Lấy trực tiếp từ likedPosts array thay vì filter từ posts
// Trước: posts.filter(post => likedPostIds.includes(post.id)) ❌
// Sau: Lấy trực tiếp từ localStorage ✅
export const selectLikedPosts = (state) => state.posts.likedPosts || [];

// ============================================
//  Selectors cho Reposted Posts
// ============================================

export const selectRepostedPostIds = (state) => state.posts.repostedPostIds;

// Lấy trực tiếp từ repostedPosts array thay vì filter từ posts
// Trước: posts.filter(post => repostedPostIds.includes(post.id)) ❌
// Sau: Lấy trực tiếp từ localStorage ✅
export const selectRepostedPosts = (state) => state.posts.repostedPosts || [];

// ============================================
//  Selector để check xem post có được like/repost chưa
// ============================================

export const selectIsLiked = (postId) => (state) => {
    return state.posts.likedPostIds.includes(postId);
};

export const selectIsReposted = (postId) => (state) => {
    return state.posts.repostedPostIds.includes(postId);
};
