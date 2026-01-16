import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants';
import threadsLogo from '@/assets/images/threads-logo.svg';
import MenuButton from './MenuButton';
import MobileFeedTabs from './MobileFeedTabs';
import { useIsAuthenticated } from '@/features/auth';

function MobileFeedHeader() {
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();

    // Chỉ hiển thị tabs ở Home và Following routes
    const shouldShowTabs =
        location.pathname === ROUTES.HOME || location.pathname === '/following';

    return (
        <div className='fixed top-0 right-0 left-0 z-50 bg-white md:hidden dark:bg-black'>
            {/* Logo */}
            <div className='flex justify-center py-4'>
                <Link to={ROUTES.HOME}>
                    <img
                        src={threadsLogo}
                        alt='logo'
                        className='w-[34px] dark:invert'
                    />
                </Link>
            </div>

            {/* Menu Button - Luôn hiển thị khi authenticated */}
            {isAuthenticated && !shouldShowTabs && <MenuButton />}

            {/* Tabs + Menu Icon - CHỈ hiển thị ở Home/Following */}
            {isAuthenticated && shouldShowTabs && (
                <div className='flex items-center border-b border-gray-300 dark:border-gray-700'>
                    <MenuButton />
                    <MobileFeedTabs />
                </div>
            )}
        </div>
    );
}

export default MobileFeedHeader;
