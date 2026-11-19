import {
    createPost,
    createReply,
    getPostById,
    getPosts,
    getReplies,
    getUserMedia,
    getUserPosts,
    getUserReplies,
    getUserReposts,
    loadMorePosts,
    toggleLikePost,
    toggleRepostPost,
} from '@/services/posts';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    //  📦 Data
    posts: [],
    replies: {
        // Cấu trúc: { [postId]: { data: [], currentPage: 1, hasMore: true, isLoading: false } }
    },
    // Bài của trang hồ sơ đang xem (tách riêng khỏi feed)
    profile: {
        username: null,
        posts: [],
        currentPage: 0,
        hasMore: true,
        isLoading: false,
    },
    // Tab Reposts / Replies / Media của hồ sơ đang xem (cùng cấu trúc với profile).
    // profileReplies.posts chứa comment (mỗi comment có .post = bài gốc)
    profileReposts: {
        username: null,
        posts: [],
        currentPage: 0,
        hasMore: true,
        isLoading: false,
    },
    profileReplies: {
        username: null,
        posts: [],
        currentPage: 0,
        hasMore: true,
        isLoading: false,
    },
    profileMedia: {
        username: null,
        posts: [],
        currentPage: 0,
        hasMore: true,
        isLoading: false,
    },
    // Feed đang xem: 'for_you' | 'following' (posts bên trên là của feed này)
    feedType: 'for_you',
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

// ========================================
// 💡 Like: đảo trạng thái ngay trên UI (dùng cho optimistic update và rollback)
// ========================================
const applyToggleLike = (state, postId) => {
    // INTERACTION CACHE
    // Bước 1: Kiểm tra xem đã track interaction của postId này chưa
    if (!state.interactions[postId]) {
        // Nếu là lần đầu click chưa có profile interaction -> phải tạo mới profile từ post data
        const post = state.posts.find((post) => post.id === postId);
        state.interactions[postId] = {
            isLiked: Boolean(post?.is_liked),
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
        const postIndex = state.likedPosts.findIndex((p) => p.id === postId);
        if (postIndex !== -1) {
            state.likedPosts.splice(postIndex, 1);
        }
    }
};

// Tìm bài theo id ở feed hoặc trang hồ sơ (tab Threads + Reposts + Media + bài gốc tab Replies)
const findPosts = (state, postId) =>
    [
        state.posts,
        state.profile.posts,
        state.profileReposts.posts,
        state.profileMedia.posts,
        state.profileReplies.posts.map((c) => c.post),
    ]
        .map((list) => list.find((p) => p.id === postId))
        .filter(Boolean);

// Thêm/bỏ post khỏi danh sách đã like (likedPostIds + likedPosts)
const setLikedList = (state, post, isLiked) => {
    const likeIndex = state.likedPostIds.indexOf(post.id);
    if (isLiked && likeIndex === -1) state.likedPostIds.push(post.id);
    if (!isLiked && likeIndex !== -1) state.likedPostIds.splice(likeIndex, 1);

    const postIndex = state.likedPosts.findIndex((p) => p.id === post.id);
    if (isLiked) {
        if (postIndex !== -1) state.likedPosts[postIndex] = post;
        else state.likedPosts.push(post);
    } else if (postIndex !== -1) {
        state.likedPosts.splice(postIndex, 1);
    }
};

// Thêm/bỏ post khỏi danh sách đã repost (repostedPostIds + repostedPosts)
const setRepostedList = (state, post, isReposted) => {
    const repostIndex = state.repostedPostIds.indexOf(post.id);
    if (isReposted && repostIndex === -1) state.repostedPostIds.push(post.id);
    if (!isReposted && repostIndex !== -1)
        state.repostedPostIds.splice(repostIndex, 1);

    const postIndex = state.repostedPosts.findIndex((p) => p.id === post.id);
    if (isReposted) {
        if (postIndex !== -1) state.repostedPosts[postIndex] = post;
        else state.repostedPosts.push(post);
    } else if (postIndex !== -1) {
        state.repostedPosts.splice(postIndex, 1);
    }
};

// ========================================
// 💡 Repost: đảo trạng thái ngay trên UI (dùng cho optimistic update và rollback)
// ========================================
const applyToggleRepost = (state, postId) => {
    const post = findPosts(state, postId)[0];
    if (!state.interactions[postId]) {
        state.interactions[postId] = {
            isLiked: Boolean(post?.is_liked),
            likeCount: post?.likes_count || 0,
            isReposted: Boolean(post?.is_reposted),
            repostCount: post?.reposts_and_quotes_count || 0,
        };
    }

    const interaction = state.interactions[postId];
    interaction.isReposted = !interaction.isReposted;
    // Đảm bảo repostCount không bị âm
    interaction.repostCount = Math.max(
        0,
        interaction.repostCount + (interaction.isReposted ? 1 : -1),
    );

    if (post) setRepostedList(state, post, interaction.isReposted);
};

// Đồng bộ interaction từ dữ liệu server (is_liked, likes_count, is_reposted,
// reposts_and_quotes_count) để không bị cache localStorage cũ / tài khoản khác ghi đè.
const syncInteraction = (state, post) => {
    const isLiked = Boolean(post.is_liked);
    const isReposted = Boolean(post.is_reposted);
    state.interactions[post.id] = {
        isLiked,
        likeCount: post.likes_count || 0,
        isReposted,
        repostCount: post.reposts_and_quotes_count || 0,
    };
    setLikedList(state, post, isLiked);
    setRepostedList(state, post, isReposted);
};

// Danh sách trang hồ sơ (tab Threads: profile, Reposts: profileReposts, Replies: profileReplies, Media: profileMedia)
// toPost: lấy bài từ phần tử để đồng bộ like/repost (tab Replies: phần tử là comment → c.post)
const addProfileListCases = (builder, thunk, key, toPost = (item) => item) => {
    builder
        .addCase(thunk.pending, (state, action) => {
            const list = state[key];
            const { username, page = 1 } = action.meta.arg;
            if (page === 1) {
                // Đổi sang hồ sơ khác → xóa bài của hồ sơ cũ
                if (list.username !== username) {
                    list.posts = [];
                    list.currentPage = 0;
                }
                list.username = username;
                list.hasMore = true;
            }
            list.isLoading = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            const list = state[key];
            // Bỏ response trễ của hồ sơ trước đó
            if (action.meta.arg.username !== list.username) return;

            const { data, pagination } = action.payload;
            if (pagination.current_page === 1) {
                list.posts = data;
            } else {
                const ids = new Set(list.posts.map((p) => p.id));
                list.posts.push(...data.filter((p) => !ids.has(p.id)));
            }
            list.currentPage = pagination.current_page;
            list.hasMore = pagination.current_page < pagination.last_page;
            list.isLoading = false;

            data.forEach((item) => syncInteraction(state, toPost(item)));
        })
        .addCase(thunk.rejected, (state, action) => {
            const list = state[key];
            if (action.meta.arg.username !== list.username) return;
            list.isLoading = false;
            list.hasMore = false;
        });
};

export const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        // ========================================
        // 💡 LAYER 1: Optimistic Updates - Chỉ lo về UI, không quan tâm server
        // ========================================

        toggleLikeOptimistic: (state, action) => {
            applyToggleLike(state, action.payload);
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
            applyToggleRepost(state, action.payload);
        },

        // 💡 Rollback khi API fail
        revertRepostOptimistic: (state, action) => {
            applyToggleRepost(state, action.payload);
        },
    },

    extraReducers: (builder) => {
        // ============================================
        // GET POSTS (Initial Load)
        // ============================================
        builder
            .addCase(getPosts.pending, (state, action) => {
                const type = action.meta.arg?.type || 'for_you';
                // Đổi feed → bỏ bài của feed cũ
                if (state.feedType !== type) state.posts = [];
                state.feedType = type;
                state.isInitialLoading = true;
                state.error = null;
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                // Response trễ của feed trước đó → bỏ
                if ((action.meta.arg?.type || 'for_you') !== state.feedType)
                    return;
                state.isInitialLoading = false;

                const { data, pagination } = action.payload;

                // REPLACE posts array (fresh data)
                state.posts = data;
                state.currentPage = pagination.current_page;
                state.totalPosts = pagination.total;

                // Calculate hasMore: current_page < last_page
                state.hasMore = pagination.current_page < pagination.last_page;

                // Like lấy theo server, repost giữ theo localStorage
                data.forEach((post) => {
                    const postId = post.id;

                    syncInteraction(state, post);

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
                if ((action.meta.arg?.type || 'for_you') !== state.feedType)
                    return;
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
                // Trang của feed trước đó (user vừa đổi feed) → bỏ
                if (action.payload.type !== state.feedType) return;

                const { data, pagination } = action.payload;

                // APPEND new posts (không replace). Repost làm bài nhảy lên đầu
                // → trang sau có thể trả lại bài đã có → bỏ trùng theo id
                const loadedIds = new Set(state.posts.map((p) => p.id));
                state.posts = [
                    ...state.posts,
                    ...data.filter((p) => !loadedIds.has(p.id)),
                ];
                state.currentPage = pagination.current_page;
                state.hasMore = pagination.current_page < pagination.last_page;

                // Like lấy theo server, repost giữ theo localStorage
                data.forEach((post) => {
                    const postId = post.id;

                    syncInteraction(state, post);

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

                const postId = post.id;
                syncInteraction(state, post);

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
        //  TRANG HỒ SƠ: tab Threads + tab Reposts
        // ============================================
        addProfileListCases(builder, getUserPosts, 'profile');
        addProfileListCases(builder, getUserReposts, 'profileReposts');
        addProfileListCases(
            builder,
            getUserReplies,
            'profileReplies',
            (c) => c.post,
        );
        addProfileListCases(builder, getUserMedia, 'profileMedia');

        // ============================================
        //  TOGGLE REPOST (optimistic → đồng bộ server / rollback)
        // ============================================
        builder
            .addCase(toggleRepostPost.pending, (state, action) => {
                applyToggleRepost(state, action.meta.arg);
            })
            .addCase(toggleRepostPost.fulfilled, (state, action) => {
                const { postId, is_reposted, reposts_and_quotes_count } =
                    action.payload;
                const interaction = state.interactions[postId];
                if (interaction) {
                    interaction.isReposted = is_reposted;
                    interaction.repostCount = reposts_and_quotes_count;
                }
                const post =
                    findPosts(state, postId)[0] ||
                    state.repostedPosts.find((p) => p.id === postId);
                if (post) setRepostedList(state, post, is_reposted);
            })
            .addCase(toggleRepostPost.rejected, (state, action) => {
                applyToggleRepost(state, action.meta.arg);
                state.error = action.payload;
            });

        // ============================================
        //  TOGGLE LIKE (optimistic → đồng bộ server / rollback)
        // ============================================
        builder
            .addCase(toggleLikePost.pending, (state, action) => {
                applyToggleLike(state, action.meta.arg);
            })
            .addCase(toggleLikePost.fulfilled, (state, action) => {
                const { postId, is_liked, likes_count } = action.payload;
                const interaction = state.interactions[postId];
                if (interaction) {
                    interaction.isLiked = is_liked;
                    interaction.likeCount = likes_count;
                }
                const post =
                    findPosts(state, postId)[0] ||
                    state.likedPosts.find((p) => p.id === postId);
                if (post) setLikedList(state, post, is_liked);
            })
            .addCase(toggleLikePost.rejected, (state, action) => {
                applyToggleLike(state, action.meta.arg);
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
                syncInteraction(state, newPost);

                // Quote: bài gốc +1 reposts_and_quotes_count
                const quotedId = newPost.quoted_post_id;
                if (quotedId) {
                    findPosts(state, quotedId).forEach((p) => {
                        p.reposts_and_quotes_count =
                            (p.reposts_and_quotes_count || 0) + 1;
                    });
                    if (state.interactions[quotedId]) {
                        state.interactions[quotedId].repostCount += 1;
                    }
                }

                // Đang ở trang hồ sơ của chính mình → hiện bài mới ở đầu
                if (
                    state.profile.username?.toLowerCase() ===
                    newPost.user?.username?.toLowerCase()
                ) {
                    state.profile.posts.unshift(newPost);
                }

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

                // Tìm parent post (feed + trang hồ sơ) và update reply count
                findPosts(state, action.payload.parent_id).forEach(
                    (parentPost) => {
                        parentPost.replies_count =
                            (parentPost.replies_count || 0) + 1;
                    },
                );
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
