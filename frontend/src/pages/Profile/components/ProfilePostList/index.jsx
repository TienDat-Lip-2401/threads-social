import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import PostCard from '@/components/PostCard';

// Danh sách bài trên trang hồ sơ: tải trang 1 khi mở, cuộn tới cuối → tải trang tiếp.
// list: { posts, currentPage, hasMore, isLoading } từ slice; fetchPage: thunk (getUserPosts / getUserReposts)
// hideUnreposted: tab Reposts của chính mình → gỡ repost là ẩn bài ngay
// renderItem: tự vẽ từng phần tử (tab Replies); mặc định vẽ PostCard
function ProfilePostList({
    username,
    list,
    fetchPage,
    emptyMessage,
    header = null,
    hideUnreposted = false,
    renderItem = null,
}) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sentinelRef = useRef(null);
    const interactions = useSelector((state) => state.posts.interactions);
    const { currentPage, hasMore, isLoading } = list;

    // Trang 1 khi mở hồ sơ
    useEffect(() => {
        dispatch(fetchPage({ username, page: 1 }));
    }, [dispatch, fetchPage, username]);

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
                    dispatch(fetchPage({ username, page: currentPage + 1 }));
                }
            },
            { rootMargin: '200px' },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [dispatch, fetchPage, username, currentPage, hasMore, isLoading]);

    const posts = hideUnreposted
        ? list.posts.filter((p) => interactions[p.id]?.isReposted !== false)
        : list.posts;

    return (
        <div>
            {header}

            <div>
                {posts.map((post) =>
                    renderItem ? (
                        renderItem(post)
                    ) : (
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
                    ),
                )}

                {!isLoading && posts.length === 0 && (
                    <div className='py-6 text-center'>
                        <p className='text-center text-sm text-gray-500'>
                            {t(emptyMessage)}
                        </p>
                    </div>
                )}

                {isLoading && (
                    <div className='flex items-center justify-center py-6'>
                        <LoaderCircle className='h-6 w-6 animate-spin text-gray-500' />
                    </div>
                )}

                <div ref={sentinelRef} className='h-1' />
            </div>
        </div>
    );
}

export default ProfilePostList;
