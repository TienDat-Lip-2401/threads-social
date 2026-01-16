import {
    createPost,
    createReply,
    getPostById,
    getPosts,
    getReplies,
    loadMorePosts,
} from '@/services/posts';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    //  📦 Data
    posts: [],
    replies: {
        // Cấu trúc: { [postId]: { data: [], currentPage: 1, hasMore: true, isLoading: false } }
    },
    currentPage: 1,
    hasMore: true,
    totalPosts: 0,
    perPage: 15,

    // ⏳ Loading States
    isInitialLoading: true,
    isFetchingMore: false,
    isCreatingPost: false,
    isLoadingReplies: false,
    isCreatingReply: false,
    error: null,

    // 💡 Track user's interactions locally (persisted to localStorage)
    likedPostIds: [], // [1, 5, 10, 25] - Posts user đã like
    repostedPostIds: [], // [3, 7, 15] - Posts user đã repost

    // GIẢI PHÁP: Lưu full post data để không bị mất khi refresh
    likedPosts: [], // [{ id: 1, content: '...' }, ...] - Full liked post objects
    repostedPosts: [], // [{ id: 3, content: '...' }, ...] - Full reposted post objects

    // 💡 Track interactions (works for both client-side/ localStorage & API)
    interactions: {},

    // 💡 Track pending API calls để prevent spam
    pendingActions: {
        // [postId]: { type: 'like'|'repost', timestamp }
    },
};

export const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        // ========================================
        // 💡 LAYER 1: Optimistic Updates - Chỉ lo về UI, không quan tâm server
        // ========================================

        toggleLikeOptimistic: (state, action) => {
            const postId = action.payload;

            // INTERACTION CACHE
            // Bước 1: Kiểm tra xem đã track interaction của postId này chưa
            if (!state.interactions[postId]) {
                // Nếu là lần đầu click chưa có profile interaction -> phải tạo mới profile từ post data
                const post = state.posts.find((post) => post.id === postId);
                state.interactions[postId] = {
                    isLiked: false,
                    likeCount: post?.likes_count || 0,
                    isReposted: false,
                    repostCount: post?.reposts_and_quotes_count || 0,
                };
            }

            // Bước 2: Toggle trạng thái LIKE
            const interaction = state.interactions[postId];
            interaction.isLiked = !interaction.isLiked;

            // 🔧 FIX: Đảm bảo likeCount không bị âm
            if (interaction.isLiked) {
                interaction.likeCount += 1;
            } else {
                interaction.likeCount = Math.max(0, interaction.likeCount - 1);
            }

            // Bước 3: Update likedPostIds array cho localStorage persistence
            const likeIndex = state.likedPostIds.indexOf(postId);

            if (interaction.isLiked && likeIndex === -1) {
                state.likedPostIds.push(postId);

                // LƯU FULL POST DATA cho LIKED
                const post = state.posts.find((p) => p.id === postId);
                if (post && !state.likedPosts.find((p) => p.id === postId)) {
                    state.likedPosts.push(post);
                }
            }

            if (!interaction.isLiked && likeIndex !== -1) {
                state.likedPostIds.splice(likeIndex, 1);

                // XÓA POST DATA khỏi LIKED
                const postIndex = state.likedPosts.findIndex(
                    (p) => p.id === postId,
                );
                if (postIndex !== -1) {
                    state.likedPosts.splice(postIndex, 1);
                }
            }
        },

        // 💡 Rollback khi API fail
        revertLikeOptimistic: (state, action) => {
            const postId = action.payload;
            const interaction = state.interactions[postId];

            if (interaction) {
                // Đảo ngược lại interaction
                interaction.isLiked = !interaction.isLiked;
                interaction.likeCount = Math.max(
                    0,
                    interaction.likeCount + (interaction.isLiked ? 1 : -1),
                );

                // Đảo ngược lại likedPostIds array và likedPosts
                const likeIndex = state.likedPostIds.indexOf(postId);

                if (interaction.isLiked && likeIndex === -1) {
                    state.likedPostIds.push(postId);

                    // Rollback: Thêm lại vào likedPosts
                    const post = state.posts.find((p) => p.id === postId);
                    if (
                        post &&
                        !state.likedPosts.find((p) => p.id === postId)
                    ) {
                        state.likedPosts.push(post);
                    }
                }

                if (!interaction.isLiked && likeIndex !== -1) {
                    state.likedPostIds.splice(likeIndex, 1);

                    // Rollback: Xóa khỏi likedPosts
                    const postIndex = state.likedPosts.findIndex(
                        (p) => p.id === postId,
                    );
                    if (postIndex !== -1) {
                        state.likedPosts.splice(postIndex, 1);
                    }
                }
            }
        },

        toggleRepostOptimistic: (state, action) => {
            const postId = action.payload;

            // 1: Update interactions cache
            if (!state.interactions[postId]) {
                const post = state.posts.find((p) => p.id === postId);
                state.interactions[postId] = {
                    isLiked: false,
                    likeCount: post?.likes_count || 0,
                    isReposted: false,
                    repostCount: post?.reposts_and_quotes_count || 0,
                };
            }

            const interaction = state.interactions[postId];
            interaction.isReposted = !interaction.isReposted;

            // 🔧 FIX: Đảm bảo repostCount không bị âm
            if (interaction.isReposted) {
                interaction.repostCount += 1;
            } else {
                interaction.repostCount = Math.max(
                    0,
                    interaction.repostCount - 1,
                );
            }

            // 2: Update repostedPostIds array
            const repostIndex = state.repostedPostIds.indexOf(postId);

            if (interaction.isReposted && repostIndex === -1) {
                state.repostedPostIds.push(postId);

                // LƯU FULL POST DATA cho REPOST
                const post = state.posts.find((p) => p.id === postId);
                if (post && !state.repostedPosts.find((p) => p.id === postId)) {
                    state.repostedPosts.push(post);
                }
            }

            if (!interaction.isReposted && repostIndex !== -1) {
                state.repostedPostIds.splice(repostIndex, 1);

                // XÓA POST DATA khỏi REPOST
                const postIndex = state.repostedPosts.findIndex(
                    (p) => p.id === postId,
                );
                if (postIndex !== -1) {
                    state.repostedPosts.splice(postIndex, 1);
                }
            }
        },

        revertRepostOptimistic: (state, action) => {
            const postId = action.payload;
            const interaction = state.interactions[postId];

            if (interaction) {
                // Đảo ngược lại interaction
                interaction.isReposted = !interaction.isReposted;
                interaction.repostCount = Math.max(
                    0,
                    interaction.repostCount + (interaction.isReposted ? 1 : -1),
                );

                // Đảo ngược lại repostedPostIds array và repostedPosts
                const repostIndex = state.repostedPostIds.indexOf(postId);

                if (interaction.isReposted && repostIndex === -1) {
                    state.repostedPostIds.push(postId);

                    // Rollback: Thêm lại vào repostedPosts
                    const post = state.posts.find((p) => p.id === postId);
                    if (
                        post &&
                        !state.repostedPosts.find((p) => p.id === postId)
                    ) {
                        state.repostedPosts.push(post);
                    }
                }

                if (!interaction.isReposted && repostIndex !== -1) {
                    state.repostedPostIds.splice(repostIndex, 1);

                    // Rollback: Xóa khỏi repostedPosts
                    const postIndex = state.repostedPosts.findIndex(
                        (p) => p.id === postId,
                    );
                    if (postIndex !== -1) {
                        state.repostedPosts.splice(postIndex, 1);
                    }
                }
            }
        },
    },

    extraReducers: (builder) => {
        // ============================================
        // GET POSTS (Initial Load)
        // ============================================
        builder
            .addCase(getPosts.pending, (state) => {
                state.isInitialLoading = true;
                state.error = null;
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.isInitialLoading = false;

                const { data, pagination } = action.payload;

                // REPLACE posts array (fresh data)
                state.posts = data;
                state.currentPage = pagination.current_page;
                state.totalPosts = pagination.total;

                // Calculate hasMore: current_page < last_page
                state.hasMore = pagination.current_page < pagination.last_page;

                // CHỈ BUILD INTERACTION CHO POST CHƯA CÓ
                data.forEach((post) => {
                    const postId = post.id;

                    // ✅ KHÔNG GHI ĐÈ nếu interaction đã tồn tại
                    if (!state.interactions[postId]) {
                        // 1: Check user đã like post này chưa từ localStorage
                        const isLiked = state.likedPostIds.includes(postId);

                        // 2: Check user đã repost post này chưa từ localStorage
                        const isReposted =
                            state.repostedPostIds.includes(postId);

                        // 3: Build interaction object = API data + localStorage data
                        state.interactions[postId] = {
                            isLiked, // Từ localStorage
                            likeCount: post.likes_count || 0, // Từ API
                            isReposted, // Từ localStorage
                            repostCount: post.reposts_and_quotes_count || 0, // Từ API
                        };
                    }

                    // UPDATE full post data trong likedPosts nếu có
                    const isLiked = state.likedPostIds.includes(postId);
                    if (isLiked) {
                        const existingIndex = state.likedPosts.findIndex(
                            (p) => p.id === postId,
                        );
                        if (existingIndex !== -1) {
                            // Update với data mới từ API (giữ post fresh)
                            state.likedPosts[existingIndex] = post;
                        } else {
                            // Thêm mới nếu chưa có (edge case: user liked trên device khác)
                            state.likedPosts.push(post);
                        }
                    }

                    // UPDATE full post data trong repostedPosts nếu có
                    const isReposted = state.repostedPostIds.includes(postId);
                    if (isReposted) {
                        const existingIndex = state.repostedPosts.findIndex(
                            (p) => p.id === postId,
                        );
                        if (existingIndex !== -1) {
                            // Update với data mới từ API (giữ post fresh)
                            state.repostedPosts[existingIndex] = post;
                        } else {
                            // Thêm mới nếu chưa có (edge case: user reposted trên device khác)
                            state.repostedPosts.push(post);
                        }
                    }
                });
            })
            .addCase(getPosts.rejected, (state, action) => {
                state.isInitialLoading = false;
                state.error = action.payload;
            });

        // ============================================
        // LOAD MORE POSTS (Infinite Scroll) - MERGE với localStorage
        // ============================================
        builder
            .addCase(loadMorePosts.pending, (state) => {
                state.isFetchingMore = true;
                state.error = null;
            })
            .addCase(loadMorePosts.fulfilled, (state, action) => {
                state.isFetchingMore = false;

                const { data, pagination } = action.payload;

                // APPEND new posts (không replace)
                state.posts = [...state.posts, ...data];
                state.currentPage = pagination.current_page;
                state.hasMore = pagination.current_page < pagination.last_page;

                // CHỈ BUILD INTERACTION CHO POST CHƯA CÓ
                data.forEach((post) => {
                    const postId = post.id;

                    // ✅ KHÔNG GHI ĐÈ nếu interaction đã tồn tại
                    if (!state.interactions[postId]) {
                        // 1: Check user đã like post này chưa từ localStorage
                        const isLiked = state.likedPostIds.includes(postId);

                        // 2: Check user đã repost post này chưa từ localStorage
                        const isReposted =
                            state.repostedPostIds.includes(postId);

                        // 3: Build interaction object = API data + localStorage data
                        state.interactions[postId] = {
                            isLiked, // Từ localStorage
                            likeCount: post.likes_count || 0, // Từ API
                            isReposted, // Từ localStorage
                            repostCount: post.reposts_and_quotes_count || 0, // Từ API
                        };
                    }

                    // UPDATE full post data trong likedPosts
                    const isLiked = state.likedPostIds.includes(postId);
                    if (isLiked) {
                        const existingIndex = state.likedPosts.findIndex(
                            (p) => p.id === postId,
                        );
                        if (existingIndex !== -1) {
                            state.likedPosts[existingIndex] = post;
                        } else {
                            state.likedPosts.push(post);
                        }
                    }

                    // UPDATE full post data trong repostedPosts
                    const isReposted = state.repostedPostIds.includes(postId);
                    if (isReposted) {
                        const existingIndex = state.repostedPosts.findIndex(
                            (p) => p.id === postId,
                        );
                        if (existingIndex !== -1) {
                            state.repostedPosts[existingIndex] = post;
                        } else {
                            state.repostedPosts.push(post);
                        }
                    }
                });
            })
            .addCase(loadMorePosts.rejected, (state, action) => {
                state.isFetchingMore = false;
                state.error = action.payload;
            });

        // ============================================
        // GET POST BY ID - REUSE createPost.fulfilled logic
        // ============================================
        builder
            .addCase(getPostById.fulfilled, (state, action) => {
                const post = action.payload;

                // Check nếu post chưa có trong array
                const existingPost = state.posts.find((p) => p.id === post.id);

                if (!existingPost) {
                    // Add vào đầu array (giống createPost)
                    state.posts.unshift(post);
                }

                // 🔧 FIX: CHỈ BUILD NẾU CHƯA CÓ INTERACTION
                const postId = post.id;
                if (!state.interactions[postId]) {
                    const isLiked = state.likedPostIds.includes(postId);
                    const isReposted = state.repostedPostIds.includes(postId);

                    state.interactions[postId] = {
                        isLiked,
                        likeCount: post.likes_count || 0,
                        isReposted,
                        repostCount: post.reposts_and_quotes_count || 0,
                    };
                }

                // UPDATE full post data
                const isLiked = state.likedPostIds.includes(postId);
                if (isLiked) {
                    const existingIndex = state.likedPosts.findIndex(
                        (p) => p.id === postId,
                    );
                    if (existingIndex !== -1) {
                        state.likedPosts[existingIndex] = post;
                    } else {
                        state.likedPosts.push(post);
                    }
                }

                const isReposted = state.repostedPostIds.includes(postId);
                if (isReposted) {
                    const existingIndex = state.repostedPosts.findIndex(
                        (p) => p.id === postId,
                    );
                    if (existingIndex !== -1) {
                        state.repostedPosts[existingIndex] = post;
                    } else {
                        state.repostedPosts.push(post);
                    }
                }
            })
            .addCase(getPostById.rejected, (state, action) => {
                state.error = action.payload;
            });

        // ============================================
        //  CREATE POST
        // ============================================
        builder
            .addCase(createPost.pending, (state) => {
                state.isCreatingPost = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.isCreatingPost = false;

                // PREPEND new post to the beginning of the list
                const newPost = action.payload;
                state.posts.unshift(newPost);

                // Update total count
                state.totalPosts += 1;

                // Build interaction cho post mới
                const postId = newPost.id;
                state.interactions[postId] = {
                    isLiked: state.likedPostIds.includes(postId),
                    likeCount: newPost.likes_count || 0,
                    isReposted: state.repostedPostIds.includes(postId),
                    repostCount: newPost.reposts_and_quotes_count || 0,
                };

                // Clear error nếu có
                state.error = null;
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isCreatingPost = false;
                state.error = action.payload;
            });

        // ============================================
        //  CREATE REPLY
        // ============================================
        builder
            .addCase(createReply.pending, (state) => {
                state.isCreatingReply = true;
                state.error = null;
            })
            .addCase(createReply.fulfilled, (state, action) => {
                state.isCreatingReply = false;

                // Tìm parent post và update reply count
                const parentPost = state.posts.find(
                    (post) => post.id === action.payload.parent_id,
                );

                if (parentPost) {
                    parentPost.replies_count =
                        (parentPost.replies_count || 0) + 1;
                }
            })
            .addCase(createReply.rejected, (state, action) => {
                state.isCreatingReply = false;
                state.error = action.payload;
            });

        // ============================================
        //  GET REPLY
        // ============================================
        builder
            .addCase(getReplies.pending, (state, action) => {
                // pending không có payload
                // Lấy từ action.meta.arg thay vì action.payload
                const postId = action.meta.arg.postId;

                if (!state.replies[postId]) {
                    state.replies[postId] = {
                        data: [],
                        currentPage: 1,
                        hasMore: true,
                        isLoading: true,
                    };
                } else {
                    state.replies[postId].isLoading = true;
                }
            })
            .addCase(getReplies.fulfilled, (state, action) => {
                const { postId, data, pagination } = action.payload;

                state.replies[postId] = {
                    data,
                    currentPage: pagination.current_page,
                    hasMore: pagination.current_page < pagination.last_page,
                    isLoading: false,
                };
            })
            .addCase(getReplies.rejected, (state, action) => {
                const postId = action.meta.arg.postId;

                if (state.replies[postId]) {
                    state.replies[postId].isLoading = false;
                }
            });
    },
});

export const {
    toggleLikeOptimistic,
    revertLikeOptimistic,
    toggleRepostOptimistic,
    revertRepostOptimistic,
} = postsSlice.actions;

export default postsSlice.reducer;
