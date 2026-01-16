import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

import lockIcon from '@/assets/icons/lock-icon.svg';
import { ROUTES } from '@/constants';
import ForgotPasswordForm from './ForgotPasswordForm';

function ForgotPassword() {
    const { t } = useTranslation();
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [sendError, setSendError] = useState(false);

    const handleSendEmailSuccess = () => {
        setIsEmailSent(true);
        setSendError(false);
    };

    const handleSendEmailError = () => {
        setIsEmailSent(false);
        setSendError(true);
    };

    return (
        <div className='password-container'>
            <img
                src={lockIcon}
                alt='lock icon'
                className='mb-4 h-24 w-24 dark:invert'
            />
            <div className='password-card__header'>
                <h1 className='password-card__title'>
                    {t('auth.forgotPasswordPage.title')}
                </h1>

                {isEmailSent ? (
                    // Success message
                    <div className='flex items-start'>
                        <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-400' />
                        <p className='password-card__description text-blue-700 dark:text-blue-400'>
                            {t('auth.forgotPasswordPage.successMessage')}
                        </p>
                    </div>
                ) : sendError ? (
                    // Error message
                    <div className='flex items-center gap-2'>
                        <XCircle className='h-5 w-5 shrink-0 text-red-600 dark:text-red-200' />
                        <p className='password-card__description text-red-600 dark:text-red-200'>
                            {t('auth.forgotPasswordPage.errorMessage')}
                        </p>
                    </div>
                ) : (
                    // Default description (only show when no success and no error)
                    <p className='password-card__description'>
                        {t('auth.forgotPasswordPage.description')}
                    </p>
                )}
            </div>

            <ForgotPasswordForm
                onSendEmailSuccess={handleSendEmailSuccess}
                onSendEmailError={handleSendEmailError}
            />

            <div>
                <Link to={ROUTES.HOME} className='password-card__link'>
                    {t('auth.backToHome')}
                </Link>
            </div>
        </div>
    );
}

// function ForgotPassword() {
//     const { t } = useTranslation();
//     const [isEmailSent, setIsEmailSent] = useState(false);
//     const [sendError, setSendError] = useState(false);

//     const handleSendEmailSuccess = () => {
//         setIsEmailSent(true);
//         setSendError(false);
//     };

//     const handleSendEmailError = () => {
//         setIsEmailSent(false);
//         setSendError(true);
//     };

//     return (
//         <div className='password-container'>
//             <img
//                 src={lockIcon}
//                 alt='lock icon'
//                 className='mb-4 h-24 w-24 dark:invert'
//             />
//             <div className='password-card__header'>
//                 <h1 className='password-card__title'>
//                     {t('auth.forgotPasswordPage.title')}
//                 </h1>

//                 {isEmailSent ? (
//                     <div className='flex items-start gap-2'>
//                         <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-500' />
//                         <p className='password-card__description text-blue-700 dark:text-blue-400'>
//                             {t('auth.forgotPasswordPage.successMessage')}
//                         </p>
//                     </div>
//                 ) : (
//                     <p className='password-card__description'>
//                         {t('auth.forgotPasswordPage.description')}
//                     </p>
//                 )}

//                 {sendError && (
//                     <div className='flex items-start gap-2'>
//                         <XCircle className='mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-500' />
//                         <p className='password-card__description text-red-800 dark:text-red-300'>
//                             {t('auth.forgotPasswordPage.errorMessage')}
//                         </p>
//                     </div>
//                 )}
//             </div>

//             {/* CHỈ hiển thị form khi chưa gửi email */}
//             {!isEmailSent && (
//                 <ForgotPasswordForm
//                     onSendEmailSuccess={handleSendEmailSuccess}
//                     onSendEmailError={handleSendEmailError}
//                 />
//             )}

//             <div>
//                 <Link to={ROUTES.HOME} className='password-card__link'>
//                     {t('auth.backToHome')}
//                 </Link>
//             </div>
//         </div>
//     );
// }
export default ForgotPassword;
