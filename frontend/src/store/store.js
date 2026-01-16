import { configureStore } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { authReducer } from '@/features/auth';
import { postsReducer } from '@/features/posts';

// Config Redux Persist - CHỈ persist interactions
const postsPersistConfig = {
    key: 'posts',
    storage,
    whitelist: [
        'likedPostIds', // Array IDs
        'repostedPostIds',
        'likedPosts', // Full post objects
        'repostedPosts',
        'interactions',
    ],
};

const persistedPostsReducer = persistReducer(postsPersistConfig, postsReducer);

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: persistedPostsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore TẤT CẢ redux-persist actions
                ignoredActions: [
                    FLUSH, // Khi flush state
                    REHYDRATE, // Khi load từ storage
                    PAUSE, // Khi pause
                    PERSIST, // Khi bắt đầu persist
                    PURGE, // Khi xóa storage
                    REGISTER, // Khi register
                ],
            },
        }),
});

export const persistor = persistStore(store);

window.store = store;
