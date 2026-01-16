import { Link } from 'react-router-dom';

import PostCard from '@/components/PostCard';
import threadsLogo from '@/assets/images/threads-logo.svg';

/**
 * Shared component cho Embed layout
 * Used by: Embed.jsx (page) & EmbedModal
 *
 */

function EmbedPostCard({ post }) {
    return (
        <div className='relative rounded-xl border px-2 pt-2 pb-10'>
            <PostCard
                postId={`embed-${post.id}`}
                avatar={post.user?.avatar_url}
                username={post.user?.username}
                timeAgo={post.created_at}
                verified={post.user?.verified}
                content={post.content}
                images={post.media_urls}
                isForCapture={true}
            />

            {/* View on Threads button */}
            <Link
                to={`${window.location.origin}/${post?.user?.username}/post/${post?.id}/embed`}
                target='_blank'
                className='absolute right-3 bottom-3 flex cursor-pointer items-center justify-center gap-1 rounded-md bg-[#f5f5f5] px-3 py-2 hover:bg-gray-200'
            >
                <span className='text-xs font-medium md:text-sm'>
                    View on Threads
                </span>
                <img src={threadsLogo} alt='logo' className='w-4' />
            </Link>
        </div>
    );
}

export default EmbedPostCard;
