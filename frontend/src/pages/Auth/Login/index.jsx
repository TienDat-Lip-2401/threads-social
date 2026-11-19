import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

import LoginForm from './components/LoginForm';
import { ROUTES } from '@/constants';
import SuccessMessage from './components/SuccessMessage';
import InstagramOAuthButton from '@/components/InstagramOAuthButton';

function Login() {
    const { t } = useTranslation();
    const location = useLocation();

    // Lấy message từ route state
    const successMessage = location.state?.message;

    return (
        <div className='flex w-full max-w-[400px] flex-col items-center p-4'>
            <h1 className='mb-4 text-lg leading-[1.31] font-bold tracking-wide text-black sm:text-base dark:text-white'>
                {t('auth.loginTitle')}
            </h1>

            {/* Success Message from reset password page */}
            {successMessage && (
                <SuccessMessage successMessage={successMessage} />
            )}

            {/* Login Form */}
            <LoginForm />

            <div className='mt-4'>
                <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className='text-sm text-gray-500'
                >
                    {t('auth.forgotPassword')}
                </Link>
            </div>

            <div className='flex h-12 items-center justify-center gap-4 text-gray-500'>
                <Separator className='w-7!' />
                <span className='text-base sm:text-sm'>{t('auth.or')}</span>
                <Separator className='w-7!' />
            </div>

            {/* Instagram OAuth Button */}
            <InstagramOAuthButton />

            <p className='mt-6 text-base sm:text-sm dark:text-white'>
                {t('auth.noAccount')}{' '}
                <Link
                    to={ROUTES.REGISTER}
                    className='text-gray-500 hover:underline'
                >
                    {t('auth.registerNow')}
                </Link>
            </p>
        </div>
    );
}
export default Login;
