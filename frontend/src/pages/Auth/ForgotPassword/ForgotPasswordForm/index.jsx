import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

import { getForgotPasswordSchema } from '../../helpers/authSchemas';
import { LoaderCircle } from 'lucide-react';
import { forgotPassword } from '@/services/auth';

function ForgotPasswordForm({ onSendEmailSuccess, onSendEmailError }) {
    const { t } = useTranslation();
    const [backEndError, setBackEndError] = useState('');
    const forgotPasswordSchema = getForgotPasswordSchema(t);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(forgotPasswordSchema),
        mode: 'onTouched',
    });

    const email = watch('email');

    const handleForgotPasswordSubmit = async (email) => {
        try {
            await forgotPassword(email);

            localStorage.setItem('reset_email', JSON.stringify(email));

            onSendEmailSuccess();
            reset();
        } catch (error) {
            console.log(error);

            if (error.response?.data?.errors?.email) {
                setBackEndError(error.response?.data?.errors?.email[0]);
            }

            onSendEmailError();
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleForgotPasswordSubmit)}
            className='password-card__form'
        >
            <div>
                <Input
                    type='text'
                    placeholder={t('auth.forgotPasswordPage.inputPlaceholder')}
                    className='input-base password-card__input'
                    onFocus={() => setBackEndError('')} // ✅ Clear on focus
                    {...register('email')}
                />

                {errors.email && (
                    <p className='mt-1 ml-3 text-sm text-red-500'>
                        {errors.email.message}
                    </p>
                )}

                {backEndError && (
                    <p className='mt-1 ml-3 text-sm text-red-500'>
                        {backEndError}
                    </p>
                )}
            </div>

            <Button
                type='submit'
                size={null}
                disabled={isSubmitting || !email || !!errors.email}
                className='bg-blue disabled:bg-blue-disabled hover:bg-blue/90 h-8 w-full text-base sm:text-sm'
            >
                {isSubmitting && (
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                )}
                {isSubmitting
                    ? t('auth.forgotPasswordPage.sending')
                    : t('auth.forgotPasswordPage.submitButton')}
            </Button>
        </form>
    );
}

export default ForgotPasswordForm;
