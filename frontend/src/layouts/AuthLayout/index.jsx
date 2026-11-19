import { Outlet, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants'
import AuthFooter from './components/AuthFooter'
import AuthBanner from './components/AuthBanner'
import ThreadsLogo from './components/ThreadsLogo'

function AuthLayout() {
    const location = useLocation()
    const hideLogo = location.pathname === ROUTES.FORGOT_PASSWORD || location.pathname === ROUTES.RESET_PASSWORD

    return (
        <div className='auth-wrapper'>
            {/* Banner - Background layer */}
            <AuthBanner />

            {/* Threads Logo */}
            {!hideLogo && <ThreadsLogo />}

            {/* Content */}
            <div className='auth-content'>
                <Outlet />
            </div>

            <AuthFooter />
        </div>
    )
}
export default AuthLayout
