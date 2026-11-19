import { useTranslation } from 'react-i18next';
import { HiMiniChevronDown } from 'react-icons/hi2';
import { IoIosMore } from 'react-icons/io';

import { useIsAuthenticated } from '@/features/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function DesktopFeedHeader() {
    const isAuthenticated = useIsAuthenticated();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const isFollowingFeed = location.pathname === ROUTES.FOLLOWING;
    const feeds = [
        { path: ROUTES.HOME, label: t('feed.forYou') },
        { path: ROUTES.FOLLOWING, label: t('feed.following') },
    ];

    const isAtProfilePage = location.pathname.startsWith('/profile');

    return (
        <div className='sticky top-0 z-10 hidden shrink-0 justify-center gap-3 px-10 py-5 md:flex'>
            {/* Profile page - Ưu tiên cao nhất */}
            {isAtProfilePage ? (
                <div className='relative flex w-full items-center justify-center'>
                    <h1 className='text-sm font-medium dark:text-white'>
                        {t('profilePage.profile')}
                    </h1>
                    <button className='absolute right-0 flex h-5 w-5 items-center justify-center rounded-full border bg-white shadow-sm dark:border-gray-400/30 dark:bg-[#242424]'>
                        <IoIosMore className='dark:text-white' />
                    </button>
                </div>
            ) : isAuthenticated ? (
                /* Home/Following - Khi authenticated */
                <>
                    <h1 className='text-sm font-medium dark:text-white'>
                        {isFollowingFeed
                            ? t('feed.following')
                            : t('feed.forYou')}
                    </h1>

                    {/* ▾ chọn feed */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                aria-label='switch feed'
                                className='flex h-5 w-5 items-center justify-center rounded-full border bg-white shadow-sm dark:border-gray-400/30 dark:bg-[#242424]'
                            >
                                <HiMiniChevronDown className='dark:text-white' />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align='center'
                            className='w-48 rounded-2xl p-2'
                        >
                            {feeds.map(({ path, label }) => (
                                <DropdownMenuItem
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className='rounded-lg px-3 py-2.5 text-sm font-medium'
                                >
                                    {label}
                                    {location.pathname === path && (
                                        <span className='ml-auto'>✓</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                /* Home - Khi chưa authenticated */
                <h1 className='text-sm font-medium dark:text-white'>
                    {t('feed.home')}
                </h1>
            )}
        </div>
    );
}
export default DesktopFeedHeader;
