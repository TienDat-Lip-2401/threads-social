import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoaderCircle } from 'lucide-react';

import PostComposer from '@/components/PostComposer';
import PostCard from '@/components/PostCard';
import { useIsAuthenticated } from '@/features/auth';
import { loadMorePosts } from '@/services/posts';
import { useIsFetchingMore } from '@/features/posts';

function Posts({ posts, hasMore }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const isFetchingMore = useIsFetchingMore();

    // Function load more post
    const handleLoadMore = () => {
        if (!isFetchingMore) {
            // Prevent duplicate calls
            dispatch(loadMorePosts());
        }
    };

    return (
        <div className='home-wrapper'>
            <div id='scrollableDiv' className='posts-container'>
                {isAuthenticated && <PostComposer />}

                <InfiniteScroll
                    dataLength={posts.length}
                    next={handleLoadMore} // Pass FUNCTION
                    hasMore={hasMore}
                    loader={
                        <div className='flex items-center justify-center p-6'>
                            <LoaderCircle className='h-5 w-5 animate-spin dark:text-gray-500' />
                        </div>
                    }
                    endMessage={
                        <div className='py-4 text-center'>
                            <p className='text-base text-gray-500 md:text-sm'>
                                {t('homePage.endMessage')}
                            </p>
                        </div>
                    }
                    scrollThreshold={0.9}
                    scrollableTarget='scrollableDiv'
                    style={{ overflow: 'visible' }}
                >
                    {/* Posts */}
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            postId={post.id}
                            content={post.content}
                            username={post.user.username}
                            avatar={post.user.avatar_url}
                            verified={post.user.verified}
                            images={post.media_urls}
                            timeAgo={post.created_at}
                            quotedPostId={post.quoted_post_id}
                            quotedPost={post.quoted_post}
                        />
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    );
}

export default Posts;
