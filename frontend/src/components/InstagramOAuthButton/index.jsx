import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

import instagramLogo from '@/assets/images/instagram_logo.png';
import { ROUTES } from '@/constants';

function InstagramOAuthButton() {
    const { t } = useTranslation();
    return (
        <Link
            to={ROUTES.LOGIN}
            className='block w-full rounded-xl border border-gray-400/40'
        >
            <div className='flex items-center justify-between p-4.5'>
                <img
                    src={instagramLogo}
                    alt='Instagram Logo'
                    className='w-[45px]'
                />
                <span className='main-heading text-base'>
                    {t('auth.continueWithInstagram')}
                </span>
                <ChevronRight className='text-gray-500' />
            </div>
        </Link>
    );
}
export default InstagramOAuthButton;
