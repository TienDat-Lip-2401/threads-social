import { useTranslation } from 'react-i18next';

import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import loveIcon from '@/assets/icons/love-icon.svg';
import commentIcon from '@/assets/icons/comment-icon.svg';
import repostIcon from '@/assets/icons/repost-icon.svg';
import { timeStamp } from '@/utils/timeStamp';

// Thẻ nhúng bài được trích dẫn (Quote). Chỉ 1 tầng, số liệu chỉ để xem.
// post = null → bài gốc đã bị xóa. showStats = false khi xem trước trong hộp đăng bài.
function QuotedPostCard({ post, showStats = true }) {
    const { t } = useTranslation();

    if (!post) {
        return (
            <div className='mt-2 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-gray-500/30'>
                {t('quotedPost.unavailable')}
            </div>
        );
    }

    const images = post.media_urls || [];
    const stats = [
        { icon: loveIcon, alt: 'likes', value: post.likes_count },
        { icon: commentIcon, alt: 'replies', value: post.replies_count },
        {
            icon: repostIcon,
            alt: 'reposts',
            value: post.reposts_and_quotes_count,
        },
    ];

    return (
        <div className='mt-2 rounded-xl border border-gray-300 px-4 py-3 dark:border-gray-500/30'>
            <div className='flex items-center gap-2'>
                <img
                    src={post.user?.avatar_url || defaultAvatar}
                    alt='avatar'
                    className='h-5 w-5 rounded-full object-cover'
                />
                <span className='text-xs font-medium'>
                    {post.user?.username}
                </span>
                <span className='text-xs font-light text-gray-400'>
                    {timeStamp(post.created_at)}
                </span>
            </div>

            <p className='mt-1 line-clamp-4 text-sm font-[350] whitespace-pre-line'>
                {post.content}
            </p>

            {/* Bài gốc lại là 1 quote → chỉ ghi chú, không lồng tiếp */}
            {post.is_quote && (
                <p className='mt-1 text-xs text-gray-400'>
                    {t('quotedPost.isQuote')}
                </p>
            )}

            {images.length > 0 && (
                <div className='mt-2 flex gap-1 overflow-hidden'>
                    {images.slice(0, 3).map((src, index) => (
                        <img
                            key={src}
                            src={src}
                            alt={`quoted image ${index + 1}`}
                            className='h-36 w-auto shrink-0 rounded-md object-cover'
                        />
                    ))}
                </div>
            )}

            {showStats && (
                <div className='mt-2 flex items-center gap-4 text-xs text-gray-500'>
                    {stats.map(({ icon, alt, value }) => (
                        <span key={alt} className='flex items-center gap-1'>
                            <img
                                src={icon}
                                alt={alt}
                                className='h-4 w-4 opacity-70 dark:invert'
                            />
                            {value || 0}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default QuotedPostCard;
