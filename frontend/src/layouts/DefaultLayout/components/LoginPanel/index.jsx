import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import instagramIcon from '@/assets/icons/instagram-icon.svg'
import { ROUTES } from '@/constants'

function LoginPanel() {
    const { t } = useTranslation()

    return (
        <div className='login-panel'>
            <h2 className='main-heading login-heading'>{t('loginPanel.title')}</h2>
            <p className='login-desc'>{t('loginPanel.description')}</p>

            <Link to={ROUTES.LOGIN} className='insta-btn'>
                <img src={instagramIcon} alt='instagram icon' className='h-5.5 w-5.5 dark:invert' />
                <p className='text-sm font-semibold'>{t('loginPanel.continueWithInstagram')}</p>
            </Link>

            <Link to={ROUTES.LOGIN} className='login-link'>
                {t('loginPanel.loginWithUsername')}
            </Link>
        </div>
    )
}
export default LoginPanel
