import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoaderCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getRegisterSchema } from '@/pages/Auth/helpers/authSchemas';
import { registerUser } from '@/services/auth';
import { useEffect, useState } from 'react';

function RegisterForm({ onRegisterSuccess, onRegisterError, onClearError }) {
    const { t } = useTranslation();
    const [serverErrors, setServerErrors] = useState({});

    const registerSchema = getRegisterSchema(t);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isValid },
    } = useForm({
        resolver: yupResolver(registerSchema),
        mode: 'onTouched',
    });

    const username = watch('username');
    const email = watch('email');
    const password = watch('password');
    const passwordConfirmation = watch('password_confirmation');

    useEffect(() => {
        onClearError();
        setServerErrors({});
    }, [username, email, password, passwordConfirmation, onClearError]);

    const handleSubmitRegisterForm = async (credentials) => {
        try {
            await registerUser(credentials);

            // Gọi callback để thông báo cho parent
            onRegisterSuccess(credentials.email);

            // Clear server errors khi success
            setServerErrors({});
            reset();
        } catch (error) {
            console.error('Error:', error);
            onRegisterError(error.message);

            // Lưu server errors
            if (error.response?.data?.errors) {
                setServerErrors(error.response.data.errors);
            }
        }
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <form
            onSubmit={handleSubmit(handleSubmitRegisterForm)}
            className={hasErrors ? 'w-full space-y-4' : 'w-full space-y-2'}
            autoComplete='off'
        >
            <div>
                <Input
                    type='text'
                    placeholder={t('auth.username')}
                    className='input-base input-auth'
                    autoComplete='off'
                    {...register('username')}
                />
                {errors.username && (
                    <p className='mt-1 ml-4 text-sm text-red-500'>
                        {errors.username.message}
                    </p>
                )}
                {serverErrors.username && (
                    <p className='mt-1 ml-4 text-sm text-red-500'>
                        {serverErrors.username[0]}
                    </p>
                )}
            </div>

            <div>
                <Input
                    type='email'
                    placeholder={t('auth.email')}
                    className='input-base input-auth'
                    autoComplete='off'
                    {...register('email')}
                />
                {errors.email && (
                    <p className='mt-1 ml-4 text-sm text-red-500'>
                        {errors.email.message}
                    </p>
                )}
                {serverErrors.email && (
                    <p className='mt-1 ml-4 text-sm text-red-500'>
                        {serverErrors.email[0]}
                    </p>
                )}
            </div>

            <div>
                <Input
                    type='password'
                    placeholder={t('auth.password')}
                    className='input-base input-auth'
                    autoComplete='off'
                    {...register('password')}
                />
                {errors.password && (
                    <p className='mt-1 ml-4 text-sm text-red-500'>
                        {errors.password.message}
                    </p>
                )}
                {serverErrors.password && (
                    <p className='mt-1 text-sm text-red-500'>
                        {serverErrors.password[0]}
                    </p>
                )}
            </div>

            <div>
                <Input
                    type='password'
                    placeholder={t('auth.confirmPassword')}
                    className='input-base input-auth'
                    autoComplete='off'
                    {...register('password_confirmation')}
                />
                {errors.password_confirmation && (
                    <p className='mt-1 ml-4 text-sm text-red-500'>
                        {errors.password_confirmation.message}
                    </p>
                )}
                {serverErrors.password_confirmation && (
                    <p className='mt-1 text-sm text-red-500'>
                        {serverErrors.password_confirmation[0]}
                    </p>
                )}
            </div>

            <Button
                type='submit'
                size={null}
                disabled={isSubmitting || !isValid}
                className='auth-btn'
            >
                {isSubmitting && (
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                )}
                {isSubmitting ? t('auth.loading') : t('auth.registerButton')}
            </Button>
        </form>
    );
}
export default RegisterForm;
