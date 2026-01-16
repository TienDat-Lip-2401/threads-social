import LoadingSpinner from '@/components/LoadingSpinner';
import { ROUTES } from '@/constants';
import { resendVerificationEmail, verifyEmail } from '@/services/auth';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

function VerifyEmail() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    console.log('🚀 ~ VerifyEmail ~ token:', token);

    const handleVerifyEmail = useCallback(
        async (token) => {
            if (!token) {
                setHasError(true);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                await verifyEmail(token);

                // ✅ Success: Navigate to login with state
                navigate(ROUTES.LOGIN, {
                    state: {
                        message: t('auth.verifyEmailPage.success'),
                    },
                    replace: true, // Replace history để user không back lại được
                });
            } catch (error) {
                console.error('Verify email error:', error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        },
        [navigate, t],
    );

    const handleResendEmail = async () => {
        try {
            await resendVerificationEmail();
            toast.success('Email send successfully', { duration: 3000 });
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message, {
                position: 'top-right',
                style: {
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontWeight: 600,
                },
            });
        }
    };

    useEffect(() => {
        handleVerifyEmail(token);
    }, [handleVerifyEmail, token]);

    // Loading state - Hiển thị spinner
    if (isLoading) {
        return <LoadingSpinner text={t('auth.verifyEmailPage.verifying')} />;
    }

    if (hasError) {
        return (
            <div className='flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-red-300 bg-red-50/80 p-6 shadow-sm dark:border-red-800/50 dark:bg-red-950/30'>
                {/* Icon */}
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50'>
                    <svg
                        className='h-8 w-8 text-red-600 dark:text-red-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        />
                    </svg>
                </div>

                {/* Message */}
                <div className='text-center'>
                    <h1 className='text-lg font-semibold text-red-600 dark:text-red-200'>
                        {t('auth.verifyEmailPage.title')}
                    </h1>
                    <p className='mt-2 text-sm text-red-600/80 dark:text-red-200/70'>
                        {t('auth.verifyEmailPage.description')}
                    </p>
                </div>

                {/* Buttons */}
                <div className='flex w-full flex-col gap-3'>
                    {/* Primary: Resend Email */}
                    <button
                        onClick={handleResendEmail}
                        className='flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800'
                    >
                        {t('auth.verifyEmailPage.resendButton')}
                    </button>

                    {/* Secondary: Go to Login */}
                    <Link
                        to={ROUTES.LOGIN}
                        className='flex w-full items-center justify-center gap-2 rounded-xl border border-gray-400/50 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                    >
                        {t('auth.verifyEmailPage.loginButton')}
                    </Link>
                </div>
            </div>
        );
    }
}

export default VerifyEmail;
