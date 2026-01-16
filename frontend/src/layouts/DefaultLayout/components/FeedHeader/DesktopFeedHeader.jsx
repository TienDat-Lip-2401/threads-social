import { useTranslation } from 'react-i18next';
import { HiMiniChevronDown } from 'react-icons/hi2';
import { IoIosMore } from 'react-icons/io';

import { useIsAuthenticated } from '@/features/auth';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';

function DesktopFeedHeader() {
    const isAuthenticated = useIsAuthenticated();
    const { t } = useTranslation();
    const location = useLocation();

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
                        {t('feed.forYou')}
                    </h1>

                    <button className='flex h-5 w-5 items-center justify-center rounded-full border bg-white shadow-sm dark:border-gray-400/30 dark:bg-[#242424]'>
                        <HiMiniChevronDown className='dark:text-white' />
                    </button>
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
