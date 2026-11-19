import { IoIosMore } from 'react-icons/io';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import InteractionBar from './components/InteractionBar';
import PostAvatar from './components/PostAvatar';
import PostHeader from './components/PostHeader';
import ImageCarousel from '../ImageCarousel';
import PostDropdown from './components/PostDropdown';
import QuotedPostCard from '../QuotedPostCard';

// const images = [
//     'https://hips.hearstapps.com/hmg-prod/images/gettyimages-1144982182.jpg',
//     'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg',
//     'https://img.freepik.com/free-photo/portrait-beautiful-purebred-pussycat-with-shorthair-orange-collar-neck-sitting-floor-reacting-camera-flash-scared-looking-light-indoor_8353-12551.jpg?semt=ais_hybrid&w=740&q=80',
//     'https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg',
// ];

function PostCard({
    postId,
    avatar,
    username,
    timeAgo,
    verified,
    content,
    images,
    showPlusIcon = true,
    isForCapture = false,
    showMetrics = true,
    quotedPostId = null, // Quote: có id nhưng quotedPost = null → bài gốc đã bị xóa
    quotedPost = null,
}) {
    return (
        <div
            className={cn(
                // Conditional styling based on capture mode
                !isForCapture &&
                    'border-b border-gray-300 pt-4 pb-2.5 dark:border-gray-500/20',
            )}
        >
            <div
                className={cn(
                    'flex items-start justify-between gap-3 p-2',
                    !isForCapture && 'px-4', // Không padding khi capture
                )}
            >
                {/* Avatar */}
                <PostAvatar
                    src={avatar}
                    showPlusIcon={!isForCapture && showPlusIcon}
                />

                {/* Content */}
                <div className='flex-1 dark:text-white!'>
                    <PostHeader
                        username={username}
                        timeAgo={timeAgo}
                        verified={verified}
                    />

                    {/* Text content */}
                    <div className='mt-1'>
                        <p className='text-sm font-[350]'>{content}</p>
                    </div>
                </div>

                {/* More Button - Chỉ show khi KHÔNG capture */}
                {!isForCapture && (
                    <PostDropdown
                        trigger={
                            <Button
                                variant='ghost'
                                size='icon'
                                className='-mt-1 h-6 w-6 rounded-full text-gray-400 hover:border-transparent hover:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 dark:hover:bg-gray-700'
                            >
                                <IoIosMore />
                            </Button>
                        }
                        align='end'
                        sideOffset={8}
                    />
                )}
            </div>

            {/* Images with drag scroll */}
            {images && images.length > 0 && (
                <ImageCarousel images={images} postId={postId} />
            )}

            {/* Quote: thẻ nhúng bài được trích dẫn */}
            {quotedPostId && (
                <div className={cn(!isForCapture && 'px-16')}>
                    <QuotedPostCard post={quotedPost} />
                </div>
            )}

            <div className={cn(!isForCapture && 'px-14')}>
                <InteractionBar postId={postId} showMetrics={showMetrics} />
            </div>
        </div>
    );
}

export default PostCard;
