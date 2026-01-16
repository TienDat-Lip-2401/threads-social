import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { ROUTES } from '@/constants';
import lockIcon from '@/assets/icons/lock-icon.svg';
import ResetPasswordForm from './ResetPasswordForm';
import { useState } from 'react';
import { XCircle } from 'lucide-react';

function ResetPassword() {
    const { t } = useTranslation();
    const [isPasswordResetError, setIsPasswordResetError] = useState(false);

    return (
        <div className='password-container'>
            <img
                src={lockIcon}
                alt='lock icon'
                className='mb-4 h-24 w-24 dark:invert'
            />
            <div className='password-card__header'>
                <h1 className='password-card__title'>
                    {t('auth.resetPasswordPage.title')}
                </h1>

                {isPasswordResetError ? (
                    <div className='flex items-center gap-2'>
                        <XCircle className='h-4 w-4 shrink-0 text-red-500 dark:text-red-200' />
                        <p className='password-card__description text-red-600 dark:text-red-200'>
                            {t('auth.resetPasswordPage.resetError')}
                        </p>
                    </div>
                ) : (
                    <p className='password-card__description'>
                        {t('auth.resetPasswordPage.description')}
                    </p>
                )}
            </div>

            <ResetPasswordForm
                onSetIsPasswordResetError={setIsPasswordResetError}
            />

            <div>
                <Link to={ROUTES.HOME} className='password-card__link'>
                    {t('auth.backToHome')}
                </Link>
            </div>
        </div>
    );
}
export default ResetPassword;
