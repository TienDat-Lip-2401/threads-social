import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

import { ROUTES } from '@/constants'

function NotFound() {
    const { t } = useTranslation()

    return (
        <div className='flex min-h-screen flex-col items-center justify-center'>
            <h1 className='main-heading'>{t('notFound.title')}</h1>
            <p className='mt-3 max-w-[250px] text-center text-[15px] text-gray-500'>{t('notFound.description')}</p>

            <Button className='mt-4 h-[34px] rounded-lg py-0 text-[15px] hover:bg-black'>
                <Link to={ROUTES.HOME}>{t('notFound.button')}</Link>
            </Button>
        </div>
    )
}
export default NotFound
