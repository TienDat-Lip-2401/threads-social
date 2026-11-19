import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

import { ROUTES } from '@/constants';
import { getResetPasswordSchema } from '../../helpers/authSchemas';
import { resetPassword } from '@/services/auth';

function ResetPasswordForm({ onSetIsPasswordResetError }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token');
    const emailData = JSON.parse(localStorage.getItem('reset_email'));
    const email = emailData?.email;

    const resetPasswordSchema = getResetPasswordSchema(t);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm({
        resolver: yupResolver(resetPasswordSchema),
        mode: 'onTouched',
    });

    const handleResetPasswordSubmit = async (data) => {
        if (!token || !email) {
            onSetIsPasswordResetError(true);
            return;
        }

        try {
            const response = await resetPassword({
                token,
                email,
                password: data.password,
                passwordConfirmation: data.password_confirmation,
            });

            console.log(response);

            // Clean up localStorage
            localStorage.removeItem('reset_email');

            // ✅ Navigate đến /login KÈM route state
            navigate(ROUTES.LOGIN, {
                state: {
                    message: t('auth.resetPasswordPage.resetSuccess'),
                },
                replace: true,
            });
        } catch (error) {
            console.log(error);
            onSetIsPasswordResetError(true);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleResetPasswordSubmit)}
            className='password-card__form'
        >
            <div className='space-y-2'>
                <div>
                    <Input
                        type='password'
                        placeholder={t('auth.resetPasswordPage.newPassword')}
                        className='input-base password-card__input'
                        {...register('password')}
                    />

                    {errors.password && (
                        <p className='mt-1 ml-3 text-sm text-red-500'>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div>
                    <Input
                        type='password'
                        placeholder={t(
                            'auth.resetPasswordPage.confirmPassword',
                        )}
                        className='input-base password-card__input'
                        {...register('password_confirmation')}
                    />

                    {errors.password_confirmation && (
                        <p className='mt-1 ml-3 text-sm text-red-500'>
                            {errors.password_confirmation.message}
                        </p>
                    )}
                </div>
            </div>
            <Button
                size={null}
                disabled={isSubmitting || !isValid}
                className='bg-blue disabled:bg-blue-disabled hover:bg-blue h-8 w-full text-base sm:text-sm'
            >
                {isSubmitting && (
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                )}
                {isSubmitting
                    ? t('auth.resetPasswordPage.changing')
                    : t('auth.resetPasswordPage.submitButton')}
            </Button>
        </form>
    );
}

export default ResetPasswordForm;
