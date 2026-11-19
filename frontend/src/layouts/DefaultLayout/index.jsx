import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { ROUTES } from '@/constants';
import NavSidebar from './components/NavSidebar';
import MobileAuthButtons from './components/MobileAuthButtons';
import FeedHeader from './components/FeedHeader';
import LoginPanel from './components/LoginPanel';
import { useTranslation } from 'react-i18next';
import { useIsAuthenticated } from '@/features/auth';

function DefaultLayout() {
    const isAuthenticated = useIsAuthenticated();
    const { t } = useTranslation();

    return (
        <div className='layout-wrapper'>
            <NavSidebar />

            {/* flex-1 = chiều cao = 100% parent */}
            <main className='main-container'>
                {/* Header - Fixed */}
                <FeedHeader />

                {/* Mobile Auth Buttons - Chỉ hiện trên mobile */}
                {!isAuthenticated && <MobileAuthButtons />}

                {/* Container với chiều cao cố định */}
                <div className='outlet-container'>
                    <Outlet />
                </div>
            </main>

            {/* Instagram Login Prompt - Chỉ hiện trên desktop */}
            {!isAuthenticated && <LoginPanel />}

            {/* Small Log in button (640px - 1023px) */}
            {!isAuthenticated && (
                <Button
                    asChild
                    size={null}
                    className='fixed top-5 right-5 z-50 hidden rounded-xl bg-black px-5 py-2 text-sm text-white sm:top-4 sm:block md:hidden dark:bg-white dark:text-black'
                >
                    <Link to={ROUTES.LOGIN}>{t('auth.loginButton')}</Link>
                </Button>
            )}
        </div>
    );
}

export default DefaultLayout;
