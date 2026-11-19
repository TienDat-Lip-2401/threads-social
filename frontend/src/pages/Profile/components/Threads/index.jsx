import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import PostCard from '@/components/PostCard';
import PostComposer from '@/components/PostComposer';
import { useProfilePosts } from '@/features/posts';
import { getUserPosts } from '@/services/posts';

function Threads() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { profile } = useOutletContext();
    const username = profile.username;

    const { posts, currentPage, hasMore, isLoading } = useProfilePosts();
    const sentinelRef = useRef(null);

    // Trang 1 khi mở hồ sơ
    useEffect(() => {
        dispatch(getUserPosts({ username, page: 1 }));
    }, [dispatch, username]);

    // Cuộn tới cuối → tải trang tiếp theo
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !isLoading &&
                    currentPage > 0
                ) {
                    dispatch(getUserPosts({ username, page: currentPage + 1 }));
                }
            },
            { rootMargin: '200px' },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [dispatch, username, currentPage, hasMore, isLoading]);

    const isFirstLoad = isLoading && currentPage === 0;

    return (
        <div>
            {profile.is_me && (
                <div className='border-b border-gray-400/50 py-1'>
                    <PostComposer />
                </div>
            )}

            {/* Danh sách threads của user */}
            <div>
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
                    />
                ))}

                {!isLoading && posts.length === 0 && (
                    <div className='py-6 text-center'>
                        <p className='text-center text-sm text-gray-500'>
                            {t('profilePage.tabs.threadsNote')}
                        </p>
                    </div>
                )}

                {(isFirstLoad || (isLoading && posts.length > 0)) && (
                    <div className='flex items-center justify-center py-6'>
                        <LoaderCircle className='h-6 w-6 animate-spin text-gray-500' />
                    </div>
                )}

                <div ref={sentinelRef} className='h-1' />
            </div>
        </div>
    );
}
export default Threads;
