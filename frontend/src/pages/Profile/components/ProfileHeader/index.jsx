import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import insightIcon from '@/assets/icons/insight-icon.svg';
import instagramIcon from '@/assets/icons/instagram-icon.svg';
import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import verifiedIcon from '@/assets/icons/verified-icon.svg';
import { useCurrentUser } from '@/features/auth';

function ProfileHeader() {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();

    const avatarSrc = currentUser?.avatar_url || defaultAvatar;
    const isVerified = currentUser?.verified;

    return (
        <header className='px-4'>
            {/* User Info */}
            <div className='mb-2 flex items-center justify-between'>
                <div className='shrink'>
                    <h1 className='text-lg font-bold'>
                        {currentUser?.name || 'User'}
                    </h1>
                    <p className='text-sm font-light'>
                        {currentUser?.username || 'User'}
                    </p>
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

            <p className='mb-2 text-sm font-light'>{currentUser?.bio || ''}</p>

            {/* Social Stats & Links */}
            <section className='flex items-center justify-between'>
                {/* Followers */}
                <div className='flex items-center gap-2'>
                    <div className='flex'>
                        <img
                            src='https://img.freepik.com/free-vector/cute-cat-face-logo-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-flat-vector_138676-9478.jpg?semt=ais_hybrid&w=740&q=80'
                            alt='followers'
                            className='h- block w-5 rounded-full border border-white object-cover'
                        />
                        <img
                            src='https://img.freepik.com/free-vector/cute-cat-face-logo-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-flat-vector_138676-9478.jpg?semt=ais_hybrid&w=740&q=80'
                            alt='followers'
                            className='-ml-1.5 block h-5 w-5 rounded-full border border-white object-cover'
                        />
                        <img
                            src='https://img.freepik.com/free-vector/cute-cat-face-logo-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-flat-vector_138676-9478.jpg?semt=ais_hybrid&w=740&q=80'
                            alt='followers'
                            className='-ml-1.5 block h-5 w-5 rounded-full border border-white object-cover'
                        />
                    </div>
                    <span className='text-sm font-light text-gray-400'>
                        {`21 ${t('profilePage.followers')}`}
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

            <button className='my-5 block w-full rounded-md border border-gray-400/50 py-1 text-sm font-medium'>
                {t('profilePage.editProfile')}
            </button>
        </header>
    );
}
export default ProfileHeader;
