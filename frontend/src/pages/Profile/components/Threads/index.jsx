import PostCard from '@/components/PostCard';
import PostComposer from '@/components/PostComposer';
import { useFetchPosts, useInitialLoading, useMyPosts } from '@/features/posts';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Threads() {
    const { t } = useTranslation();

    // Fetch posts để đảm bảo luôn có data
    useFetchPosts();

    const myPosts = useMyPosts();
    const isLoading = useInitialLoading();

    // Loading state
    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-10'>
                <LoaderCircle className='h-6 w-6 animate-spin text-gray-500' />
            </div>
        );
    }

    return (
        <div>
            <div className='border-b border-gray-400/50 py-1'>
                <PostComposer />
            </div>

            {/* Danh sách threads của user */}
            <div>
                {myPosts.length > 0 ? (
                    myPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            postId={post.id}
                            content={post.content}
                            username={post.user.username}
                            avatar={post.user.avatar_url}
                            verified={post.user.verified}
                            images={post.media_urls}
                            timeAgo={post.created_at}
                        />
                    ))
                ) : (
                    <div className='py-6 text-center'>
                        <p className='text-center text-sm text-gray-500'>
                            {t('profilePage.tabs.threadsNote')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default Threads;
