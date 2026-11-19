import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import { timeStamp } from '@/utils/timeStamp';
import ModalToolbar from '../ModalToolbar';
import ImageCarousel from '@/components/ImageCarousel';

// showToolbar = false: dùng ngoài hộp trả lời (tab Replies trên hồ sơ)
function ReplyItem({ reply, showToolbar = true }) {
    const avatarSrc = reply.user?.avatar_url || defaultAvatar;

    return (
        <div className='flex gap-3 px-6'>
            {/* Avatar + Vertical Line */}
            <div className='flex flex-col items-center'>
                <img
                    src={avatarSrc}
                    alt='avatar'
                    className='h-9 w-9 rounded-full object-cover'
                />
                <div className='mt-2 w-0.5 flex-1 bg-gray-400/50 dark:bg-gray-400/30'></div>
            </div>

            {/* Content */}
            <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                    <span className='text-base font-medium md:text-sm dark:text-white'>
                        {reply.user?.username || 'Unknown'}
                    </span>
                    <span className='text-base text-gray-400 md:text-sm dark:text-gray-500'>
                        {timeStamp(reply.created_at) || 0}
                    </span>
                </div>

                {/* Post Text */}
                <p className='mb-2 text-base md:text-sm dark:text-white'>
                    {reply.content}
                </p>

                {/* Media nếu có */}
                {reply.media_urls && reply.media_urls.length > 0 && (
                    <ImageCarousel images={reply.media_urls} />
                )}

                {/* Toolbar icons - optional */}
                {showToolbar && (
                    <div className='mt-3'>
                        <ModalToolbar />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReplyItem;
