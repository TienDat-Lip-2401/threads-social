import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { ROUTES } from '@/constants'
import { useTranslation } from 'react-i18next'

function MobileAuthButtons() {
    const { t } = useTranslation()

    return (
        <>
            <div className='fixed top-14 right-0 left-0 z-50 flex gap-2 bg-gray-100 px-4 py-3 sm:hidden dark:border-gray-700 dark:bg-black'>
                <Button
                    asChild
                    size={null}
                    className='h-8 flex-1 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-black dark:border-gray-400/30 dark:bg-black dark:text-white'
                >
                    <Link to={ROUTES.LOGIN}>{t('auth.loginButton')}</Link>
                </Button>
                <Button
                    size={null}
                    className='h-8 flex-1 rounded-lg bg-black text-sm font-semibold text-white dark:bg-white dark:text-black'
                >
                    {t('auth.getApp')}
                </Button>
            </div>
            <Separator className='fixed top-[111px] right-0 left-0 z-50 bg-gray-400/30 sm:hidden' />
        </>
    )
}
export default MobileAuthButtons
