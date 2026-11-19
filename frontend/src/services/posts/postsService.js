import { createAsyncThunk } from '@reduxjs/toolkit';

import http from '@/utils/http';

// ========================================
// 💡 GET POST
// Để có action.payload, CẦN try/catch + rejectWithValue
// ========================================
export const getPosts = createAsyncThunk(
    'posts/getPosts',
    async (
        { type = 'for_you', page = 1, perPage = 10 } = {},
        { rejectWithValue },
    ) => {
        //
        try {
            const response = await http.get('posts/feed', {
                params: {
                    type,
                    page,
                    per_page: perPage,
                },
            });

            // console.log('🚀 ~ response:', response);
            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || {
                        message: error.message,
                        status: error.response?.status,
                    } ||
                    'Error happens. Please try again!',
            );
        }
    },
);

// ========================================
// 💡 GET SINGLE POST BY ID
// ========================================
export const getPostById = createAsyncThunk(
    'posts/getPostById',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await http.get(`posts/${postId}`);

            console.log(`Get post ${postId}:`, response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);

// ========================================
// 💡 LOAD MORE POSTS (infinite scroll)
// Để có action.payload, CẦN try/catch + rejectWithValue
// ========================================
export const loadMorePosts = createAsyncThunk(
    'posts/loadMorePosts',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Lấy state hiện tại
            const { posts } = getState();

            // Lấy trang hiện tại & tính trang kế tiếp
            const nextPage = posts.currentPage + 1;

            // Gọi API để lấy thêm posts
            const response = await http.get('posts/feed', {
                params: {
                    type: 'for_you', // TODO: Make dynamic based on active tab
                    page: nextPage,
                    per_page: 10,
                },
            });

            return response;
        } catch (error) {
            // Trả lỗi cho reducer xử lý
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);

// ========================================
// 💡 CREATE NEW POST (multipart/form-data)
// ========================================
export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            // Tạo FormData object
            const formData = new FormData();

            // 1. Append text content
            formData.append('content', postData.content);

            // 2. Append images nếu có
            // ✅ Only append if media exists and has items
            if (postData.media && postData.media.length > 0) {
                // ✅ Validate max 4 images
                if (postData.media.length > 4) {
                    return rejectWithValue({
                        message: 'Maximum 4 images allowed',
                    });
                }

                postData.media.forEach((file) => {
                    formData.append('media[]', file);
                });
            }

            // Call API với FormData
            const response = await http.post('posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Create post: ', response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);

// ========================================
// 💡 CREATE REPLY (multipart/form-data)
// ========================================
export const createReply = createAsyncThunk(
    'posts/createReply',
    async ({ parentPostId, replyData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();

            // 1. Content
            formData.append('content', replyData.content);

            // 2. Media files (optional)
            if (replyData.media && replyData.media.length > 0) {
                replyData.media.forEach((file) => {
                    formData.append('media[]', file);
                });
            }

            // 3. Reply permission với fallback
            formData.append(
                'reply_permission',
                replyData.reply_permission || 'everyone',
            );

            // Call API với FormData
            const response = await http.post(
                `posts/${parentPostId}/comments`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );
            console.log('Create reply: ', response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);

// ========================================
// 💡 GET REPLIES của một post
// ========================================
export const getReplies = createAsyncThunk(
    'posts/getReplies',
    async ({ postId, page = 1, perPage = 10 }, { rejectWithValue }) => {
        try {
            const response = await http.get(`posts/${postId}/comments`, {
                params: {
                    page,
                    per_page: perPage,
                },
            });

            console.log(`Get replies from ${postId}`, response.data);
            return {
                postId, // Để biết replies này thuộc post nào (pass through từ argument)
                ...response,
            };
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);

// ========================================
// 💡 DANH SÁCH BÀI TRÊN TRANG HỒ SƠ (có phân trang)
// getUserPosts: tab Threads (GET users/{username}/posts)
// getUserReposts: tab Reposts (GET users/{username}/reposts)
// ========================================
const createUserListThunk = (type, path) =>
    createAsyncThunk(
        type,
        async ({ username, page = 1, perPage = 10 }, { rejectWithValue }) => {
            try {
                const response = await http.get(
                    `users/${encodeURIComponent(username)}/${path}`,
                    { params: { page, per_page: perPage } },
                );
                return response; // { data, pagination }
            } catch (error) {
                return rejectWithValue({
                    message: error.response?.data?.message || error.message,
                    status: error.response?.status,
                });
            }
        },
    );

export const getUserPosts = createUserListThunk('posts/getUserPosts', 'posts');
export const getUserReposts = createUserListThunk(
    'posts/getUserReposts',
    'reposts',
);

// ========================================
// 💡 TOGGLE LIKE: POST posts/{id}/like → { is_liked, likes_count }
// UI đổi ngay ở toggleLikePost.pending, đồng bộ server ở fulfilled, rollback ở rejected (postsSlice)
// ========================================
export const toggleLikePost = createAsyncThunk(
    'posts/toggleLike',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await http.post(`posts/${postId}/like`);
            return { postId, ...response.data };
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);

// ========================================
// 💡 TOGGLE REPOST: POST posts/{id}/repost → { is_reposted, reposts_and_quotes_count }
// Giống like: UI đổi ngay ở pending, đồng bộ server ở fulfilled, rollback ở rejected (postsSlice)
// ========================================
export const toggleRepostPost = createAsyncThunk(
    'posts/toggleRepost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await http.post(`posts/${postId}/repost`);
            return { postId, ...response.data };
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
            });
        }
    },
);
