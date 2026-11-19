import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import insightIcon from '@/assets/icons/insight-icon.svg';
import instagramIcon from '@/assets/icons/instagram-icon.svg';
import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import verifiedIcon from '@/assets/icons/verified-icon.svg';
import LoginAlertDialog from '@/components/LoginAlertDialog';
import { useCurrentUser } from '@/features/auth';
import { useFollowState, useToggleFollow } from '@/features/follows';

// profile: { username, name, bio, avatar_url, verified, posts_count, is_me,
//            followers_count, following_count, is_following, followers_preview } từ GET users/{username}
function ProfileHeader({ profile, onEditProfile }) {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const toggleFollow = useToggleFollow();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const follow = useFollowState(profile.id, {
        isFollowing: profile.is_following,
        followersCount: profile.followers_count,
    });

    // Avatar người theo dõi: theo dõi / bỏ theo dõi ngay trên trang → thêm / bớt mình ở đầu
    const preview = (profile.followers_preview || []).filter(
        (u) => u.id !== currentUser?.id,
    );
    if (follow.isFollowing && currentUser) preview.unshift(currentUser);

    const handleFollow = () => {
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }
        toggleFollow({
            userId: profile.id,
            username: profile.username,
            isFollowing: follow.isFollowing,
            followersCount: follow.followersCount,
        });
    };

    const avatarSrc = profile?.avatar_url || defaultAvatar;
    const isVerified = profile?.verified;

    return (
        <header className='px-4'>
            {/* User Info */}
            <div className='mb-2 flex items-center justify-between'>
                <div className='shrink'>
                    <h1 className='text-lg font-bold'>
                        {profile?.name || profile?.username}
                    </h1>
                    <p className='text-sm font-light'>{profile?.username}</p>
                </div>

                {isVerified ? (
                    <figure className='relative shrink-0'>
                        <img
                            src={avatarSrc}
                            alt='user avatar'
                            className='block h-21 w-21 rounded-full object-cover'
                        />
                        <img
                            src={verifiedIcon}
                            alt='verified icon'
                            className='absolute bottom-[12%] left-[10%] h-4 w-4'
                        />
                    </figure>
                ) : (
                    <figure>
                        <img
                            src={avatarSrc}
                            alt='user avatar'
                            className='block h-21 w-21 rounded-full object-cover'
                        />
                    </figure>
                )}
            </div>

            <p className='mb-2 text-sm font-light whitespace-pre-line'>
                {profile?.bio || ''}
            </p>

            {/* Social Stats & Links */}
            <section className='flex items-center justify-between'>
                {/* Followers */}
                <div className='flex items-center gap-2'>
                    {preview.length > 0 && (
                        <div className='flex'>
                            {preview.slice(0, 3).map((u, index) => (
                                <img
                                    key={u.id}
                                    src={u.avatar_url || defaultAvatar}
                                    alt={u.username}
                                    className={`block h-5 w-5 rounded-full border border-white object-cover ${index > 0 ? '-ml-1.5' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                    <span className='text-sm font-light text-gray-400'>
                        {`${follow.followersCount ?? 0} ${t('profilePage.followers')}`}
                    </span>
                </div>

                {/* Social Links */}
                <nav>
                    <ul className='flex'>
                        <li className='flex'>
                            <Link
                                to='#'
                                className='block rounded-full p-1.5 hover:bg-gray-300'
                            >
                                <img
                                    src={insightIcon}
                                    alt='insight icon'
                                    className='h-5.5 w-5.5'
                                />
                            </Link>
                        </li>
                        <li className='flex'>
                            <Link
                                to='#'
                                className='block rounded-full p-1.5 hover:bg-gray-300'
                            >
                                <img
                                    src={instagramIcon}
                                    alt='insight icon'
                                    className='h-5.5 w-5.5'
                                />
                            </Link>
                        </li>
                    </ul>
                </nav>
            </section>

            {/* Chỉ hồ sơ của mình mới sửa được */}
            {profile?.is_me ? (
                <button
                    type='button'
                    onClick={onEditProfile}
                    className='my-5 block w-full rounded-md border border-gray-400/50 py-1 text-sm font-medium'
                >
                    {t('profilePage.editProfile')}
                </button>
            ) : (
                <button
                    type='button'
                    onClick={handleFollow}
                    className={
                        follow.isFollowing
                            ? 'my-5 block w-full rounded-md border border-gray-400/50 py-1 text-sm font-medium'
                            : 'my-5 block w-full rounded-md border border-black bg-black py-1 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-black'
                    }
                >
                    {follow.isFollowing
                        ? t('profilePage.followingButton')
                        : t('profilePage.follow')}
                </button>
            )}

            {isLoginOpen && (
                <LoginAlertDialog
                    isOpen={isLoginOpen}
                    onClose={() => setIsLoginOpen(false)}
                />
            )}
        </header>
    );
}
export default ProfileHeader;
