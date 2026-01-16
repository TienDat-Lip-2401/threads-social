import LoadingSpinner from './components/LoadingSpinner';
import Posts from './components/Posts';
import {
    useAllPosts,
    useFetchPosts,
    useHasMore,
    useInitialLoading,
} from '@/features/posts';

function Home() {
    // Fetch initial posts
    useFetchPosts();

    // Get data from Redux
    const posts = useAllPosts();
    const isInitialLoading = useInitialLoading();
    const hasMore = useHasMore();

    // Nếu Initial loading → Hiển thị spinner
    if (isInitialLoading) {
        return <LoadingSpinner />;
    }

    // Nếu đã load xong → Hiển thị Posts component
    return <Posts posts={posts} hasMore={hasMore} />;
}

export default Home;
