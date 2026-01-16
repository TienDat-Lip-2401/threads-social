import * as yup from 'yup';

// Tạo function nhận t để build schema
export const getLoginSchema = (t) => {
    return yup.object({
        identifier: yup
            .string()
            .trim()
            .min(3, t('auth.validation.identifierMin'))
            .required(t('auth.validation.identifierRequired')),
        password: yup
            .string()
            .min(8, t('auth.validation.passwordMin'))
            .required(t('auth.validation.passwordRequired')),
    });
};

export const getRegisterSchema = (t) => {
    return yup.object({
        username: yup
            .string()
            .trim()
            .min(3, t('auth.validation.usernameMin'))
            .max(30, t('auth.validation.usernameMax'))
            .matches(/^[a-zA-Z0-9_.]+$/, t('auth.validation.usernameInvalid'))
            .required(t('auth.validation.usernameRequired')),
        email: yup
            .string()
            .email(t('auth.validation.emailInvalid'))
            .matches(
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                t('auth.validation.emailInvalid'),
            )
            .required(t('auth.validation.emailRequired')),
        password: yup
            .string()
            .min(8, t('auth.validation.passwordMin'))
            .required(t('auth.validation.passwordRequired')),
        password_confirmation: yup
            .string()
            .oneOf(
                [yup.ref('password')],
                t('auth.validation.confirmPasswordMismatch'),
            )
            .required(t('auth.validation.confirmPasswordRequired')),
    });
};

export const getForgotPasswordSchema = (t) => {
    return yup.object({
        email: yup
            .string()
            .email(t('auth.validation.emailInvalid'))
            .matches(
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                t('auth.validation.emailInvalid'),
            )
            .required(t('auth.validation.emailRequired')),
    });
};

export const getResetPasswordSchema = (t) => {
    return yup.object({
        password: yup
            .string()
            .min(8, t('auth.validation.passwordMin'))
            .required(t('auth.validation.passwordRequired')),
        password_confirmation: yup
            .string()
            .oneOf(
                [yup.ref('password')],
                t('auth.validation.confirmPasswordMismatch'),
            )
            .required(t('auth.validation.confirmPasswordRequired')),
    });
};
