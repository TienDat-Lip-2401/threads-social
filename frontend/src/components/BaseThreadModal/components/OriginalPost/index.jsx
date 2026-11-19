import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import ImageCarousel from '@/components/ImageCarousel';
import { cn } from '@/lib/utils';
import { timeStamp } from '@/utils/timeStamp';

/**
 * Component hiển thị post gốc trong Reply modal
 */
function OriginalPost({ post }) {
    if (!post) return null;

    // Check original post có ảnh không
    const hasImages = post.media_urls && post.media_urls.length > 0;

    return (
        <div className='px-6 pt-3 dark:border-gray-400/30'>
            <div className='flex gap-3'>
                {/* Avatar + Vertical Line */}
                <div className='flex flex-col items-center'>
                    <img
                        src={post.user?.avatar_url || defaultAvatar}
                        alt='avatar'
                        className='h-9 w-9 rounded-full object-cover'
                    />

                    <div
                        className={cn(
                            'mt-3 w-0.5 flex-1 bg-gray-400/50 dark:bg-gray-400/30',
                            hasImages ? 'min-h-[310px]' : 'min-h-4',
                        )}
                    ></div>
                </div>

                {/* Content */}
                <div className='flex-1'>
                    {/* Username & Time */}
                    <div className='mb-1 flex items-center gap-2'>
                        <span className='text-base font-semibold md:text-sm dark:text-white'>
                            {post.user?.username || 'Unknown'}
                        </span>
                        <span className='text-base text-gray-400 md:text-sm dark:text-gray-500'>
                            {timeStamp(post.created_at) || ''}
                        </span>
                    </div>

                    {/* Post Text */}
                    <p className='mb-2 text-base md:text-sm dark:text-white'>
                        {post.content}
                    </p>

                    {/* render ImagesCarousel nếu hasImages  */}
                    {hasImages && (
                        <ImageCarousel
                            images={post.media_urls}
                            className='flex gap-1'
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default OriginalPost;
