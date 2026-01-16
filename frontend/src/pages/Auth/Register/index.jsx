import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';

import { ROUTES } from '@/constants';
import RegisterForm from './components/RegisterForm';
import RegisterSuccessMessage from './components/RegisterSuccessMessage';
import RegisterUnsuccessMessage from './components/RegisterUnsuccessMessage';

function Register() {
    const { t } = useTranslation();
    const [isRegistered, setIsRegistered] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [registerError, setRegisterError] = useState('');

    const handleRegisterSuccess = useCallback((email) => {
        setIsRegistered(true);
        setUserEmail(email);
        setRegisterError('');
    }, []);

    const handleRegisterError = useCallback((error) => {
        setRegisterError(error);
        setIsRegistered(false);
    }, []);

    const handleClearError = useCallback(() => setRegisterError(''), []);

    return (
        <div className='flex w-full max-w-[400px] flex-col items-center p-4'>
            <h1 className='mb-4 text-lg leading-[1.31] font-bold tracking-wide text-black sm:text-base dark:text-white'>
                {t('auth.registerTitle')}
            </h1>

            {/* SUCCESS MESSAGE - Hiển thị ở giữa title và form */}
            {isRegistered && <RegisterSuccessMessage userEmail={userEmail} />}

            {/* Error Message */}
            {registerError && (
                <RegisterUnsuccessMessage errorMessage={registerError} />
            )}

            {/* Register Form */}
            <RegisterForm
                onRegisterSuccess={handleRegisterSuccess}
                onRegisterError={handleRegisterError}
                onClearError={handleClearError}
            />

            <div className='mt-4'>
                <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className='text-base text-gray-500 sm:text-sm'
                >
                    {t('auth.forgotPassword')}
                </Link>
            </div>

            <div className='flex h-12 items-center justify-center gap-4 text-gray-500'>
                <Separator className='w-7! dark:bg-gray-400/50' />
                <span className='text-base sm:text-sm'>{t('auth.or')}</span>
                <Separator className='w-7! dark:bg-gray-400/50' />
            </div>

            <p className='mt-2 text-base sm:text-sm dark:text-white'>
                {t('auth.haveAccount')}{' '}
                <Link
                    to={ROUTES.LOGIN}
                    className='text-gray-500 hover:underline'
                >
                    {t('auth.loginNow')}
                </Link>
            </p>
        </div>
    );
}

export default Register;
