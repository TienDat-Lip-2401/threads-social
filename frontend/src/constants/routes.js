const ROUTES = {
    HOME: '/',
    FOLLOWING: '/following', // feed Đang theo dõi (cần đăng nhập)
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    EMBED_CODE: '/:username/post/:postId/embed',
    PROFILE: '/profile',
    PROFILE_USER: '/profile/:username',
    REPLIES: 'replies',
    MEDIA: 'media',
    REPOSTS: 'reposts',
};

export default ROUTES;
