import { useTranslation } from 'react-i18next';

import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import { useCurrentUser } from '@/features/auth';
import { useFollowState, useToggleFollow } from '@/features/follows';
import { cn } from '@/lib/utils';

// 1 dòng: avatar + username/tên (bấm → mở hồ sơ) + nút Theo dõi
// shortcut: khách không có nút theo dõi trong modal (thay vì mở hộp mời đăng nhập)
function FollowUserRow({ user, onOpenUser }) {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const toggleFollow = useToggleFollow();
    const follow = useFollowState(user.id, { isFollowing: user.is_following });
    const showButton = currentUser && !user.is_me;

    return (
        <div className='flex items-center gap-3 px-6 py-2.5'>
            <button
                type='button'
                onClick={() => onOpenUser(user.username)}
                className='flex min-w-0 flex-1 items-center gap-3 text-left'
            >
                <img
                    src={user.avatar_url || defaultAvatar}
                    alt={user.username}
                    className='h-9 w-9 shrink-0 rounded-full object-cover'
                />
                <span className='min-w-0'>
                    <span className='block truncate text-sm font-medium hover:underline'>
                        {user.username}
                    </span>
                    {user.name && (
                        <span className='block truncate text-sm text-gray-500'>
                            {user.name}
                        </span>
                    )}
                </span>
            </button>

            {showButton && (
                <button
                    type='button'
                    onClick={() =>
                        toggleFollow({
                            userId: user.id,
                            username: user.username,
                            isFollowing: follow.isFollowing,
                        })
                    }
                    className={cn(
                        'w-28 shrink-0 rounded-lg border py-1 text-sm font-medium',
                        follow.isFollowing
                            ? 'border-gray-400/50 text-gray-500'
                            : 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black',
                    )}
                >
                    {follow.isFollowing
                        ? t('profilePage.followingButton')
                        : t('profilePage.follow')}
                </button>
            )}
        </div>
    );
}

export default FollowUserRow;
