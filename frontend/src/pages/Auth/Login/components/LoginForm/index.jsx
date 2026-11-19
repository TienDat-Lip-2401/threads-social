import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { getLoginSchema } from '@/pages/Auth/helpers/authSchemas';
import { getCurrentUser, loginUser } from '@/services/auth';
import {
    saveLocalRefreshToken,
    saveLocalAccessToken,
} from '@/utils/authStorage';
import { useCurrentUser } from '@/features/auth';

function LoginForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [params] = useSearchParams();

    // Lấy thông tin user hiện tại
    const currentUser = useCurrentUser();

    // Gọi function để tạo schema với i18n
    const loginSchema = getLoginSchema(t);

    // Khởi tạo React Hook Form với Yup validation
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm({ resolver: yupResolver(loginSchema), mode: 'onTouched' });

    // Redirect nếu user đã đăng nhập
    useEffect(() => {
        if (currentUser) {
            // Redirect về trang user muốn truy cập ban đầu (từ query param) hoặc về trang chủ
            const continuePath = params.get('continue') || ROUTES.HOME;
            navigate(continuePath);
        }
    }, [currentUser, navigate, params]);

    const handleSubmitLoginForm = async ({ identifier: login, password }) => {
        try {
            // Chuyển đổi field name cho API
            const credentials = { login, password };

            // Gọi API đăng nhập và lấy tokens
            const { access_token, refresh_token } =
                await loginUser(credentials);

            // Lưu tokens vào localStorage
            saveLocalAccessToken(access_token);
            saveLocalRefreshToken(refresh_token);

            // Lấy thông tin user và lưu vào Redux
            await dispatch(getCurrentUser()).unwrap();

            reset();
        } catch (error) {
            console.error('Error:', error);
            const message =
                error.response?.data?.message || t('auth.messages.loginError');
            const isUnverified = error.response?.status === 403;

            toast.error(message, {
                duration: isUnverified ? 8000 : 3000,
                position: 'top-right',
                style: {
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontWeight: 600,
                },
                // 403 = email chưa xác thực → cho đi tới trang gửi lại email (điền sẵn nếu đăng nhập bằng email)
                ...(isUnverified && {
                    action: {
                        label: t('auth.verifyEmailPage.resendButton'),
                        onClick: () =>
                            navigate(ROUTES.VERIFY_EMAIL, {
                                state: {
                                    email: login.includes('@') ? login : '',
                                },
                            }),
                    },
                }),
            });
        }
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <form
            onSubmit={handleSubmit(handleSubmitLoginForm)}
            className={hasErrors ? 'w-full space-y-4' : 'w-full space-y-2'}
            autoComplete='off'
        >
            <div>
                <Input
                    type='text'
                    placeholder={t('auth.identifier')}
                    className='input-base input-auth'
                    autoComplete='off'
                    {...register('identifier')}
                />
                {errors.identifier && (
                    <p className='mt-1 ml-4 text-sm text-red-500'>
                        {errors.identifier.message}
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
                        {' '}
                        {errors.password.message}
                    </p>
                )}
            </div>

            <Button
                type='submit'
                size={null}
                disabled={isSubmitting || !isValid}
                className={cn('auth-btn', isSubmitting && 'cursor-not-allowed')}
            >
                {isSubmitting && (
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                )}
                {isSubmitting ? t('auth.loading') : t('auth.loginButton')}
            </Button>
        </form>
    );
}

export default LoginForm;
