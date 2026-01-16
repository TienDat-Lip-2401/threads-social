import { FaPlus } from 'react-icons/fa6';
import defaultAvatar from '@/assets/images/default-avatar.jpeg';

function PostAvatar({ src, showPlusIcon = false }) {
    const avatarSrc = src || defaultAvatar;

    return (
        <div className='relative'>
            <img
                src={avatarSrc}
                alt='user avatar'
                className='h-9 w-9 shrink-0 rounded-full object-cover'
            />

            {showPlusIcon && (
                <div className='absolute -right-1 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-white bg-black dark:border-black dark:bg-white'>
                    <FaPlus className='h-2.5 w-2.5 text-white dark:text-black' />
                </div>
            )}
        </div>
    );
}

export default PostAvatar;
