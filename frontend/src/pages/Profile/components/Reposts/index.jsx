import { useFetchPosts, useRepostedPosts } from '@/features/posts';
import PostCard from '@/components/PostCard';
import EmptyMessage from '../EmptyMessage';

function Reposts() {
    // Fetch posts để đảm bảo luôn có data
    useFetchPosts();

    const repostedPosts = useRepostedPosts();
    console.log('🚀 ~ Reposts ~ repostedPosts:', repostedPosts);

    if (repostedPosts.length === 0) {
        return <EmptyMessage message='profilePage.tabs.repostsNote' />;
    }

    return (
        <div>
            {repostedPosts.map((post) => (
                <PostCard
                    key={post.id}
                    avatar={post.user?.avatar_url}
                    username={post.user?.username}
                    timeAgo={post.user?.created_at}
                    verified={post.user?.verified}
                    content={post.content}
                    images={post}
                    {...post}
                    showMetrics={true}
                />
            ))}
        </div>
    );
}
export default Reposts;
