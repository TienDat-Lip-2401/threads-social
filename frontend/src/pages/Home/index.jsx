import { Navigate, useMatch } from 'react-router-dom';

import LoadingSpinner from './components/LoadingSpinner';
import Posts from './components/Posts';
import { ROUTES } from '@/constants';
import { useIsAuthenticated } from '@/features/auth';
import { getLocalAccessToken } from '@/utils/authStorage';
import {
    useAllPosts,
    useFetchPosts,
    useHasMore,
    useInitialLoading,
} from '@/features/posts';

// "/" → feed Dành cho bạn, "/following" → feed Đang theo dõi
function Home() {
    const isFollowing = Boolean(useMatch(ROUTES.FOLLOWING));
    const isAuthenticated = useIsAuthenticated();
    // Lúc mới tải trang auth chưa kịp có → dựa vào token đã lưu để không đá nhầm user đã đăng nhập
    const canSeeFollowing = isAuthenticated || Boolean(getLocalAccessToken());
    const type = isFollowing && canSeeFollowing ? 'following' : 'for_you';

    // Fetch initial posts (đổi feed → tải lại)
    useFetchPosts(type);

    // Get data from Redux
    const posts = useAllPosts();
    const isInitialLoading = useInitialLoading();
    const hasMore = useHasMore();

    // Khách vào /following → về trang chủ
    if (isFollowing && !canSeeFollowing) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    // Nếu Initial loading → Hiển thị spinner
    if (isInitialLoading) {
        return <LoadingSpinner />;
    }

    // Nếu đã load xong → Hiển thị Posts component
    return <Posts posts={posts} hasMore={hasMore} feedType={type} />;
}

export default Home;
