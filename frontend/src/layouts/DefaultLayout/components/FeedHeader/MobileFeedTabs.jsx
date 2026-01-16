import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants'

const TAB_BASE_CLASSES = 'flex-1 px-4 py-2 text-center text-base md:text-sm transition-colors'
const TAB_ACTIVE_CLASSES = '-mb-px border-b border-black font-medium text-black dark:border-white dark:text-white'
const TAB_INACTIVE_CLASSES = 'border-b border-transparent font-normal text-gray-500 dark:text-gray-500'

function MobileFeedTabs() {
    const { t } = useTranslation()

    return (
        <div className='flex flex-1 justify-center'>
            <NavLink
                to={ROUTES.HOME}
                className={({ isActive }) => cn(TAB_BASE_CLASSES, isActive ? TAB_ACTIVE_CLASSES : TAB_INACTIVE_CLASSES)}
            >
                {t('feed.forYou')}
            </NavLink>

            <NavLink
                to='/following'
                className={({ isActive }) => cn(TAB_BASE_CLASSES, isActive ? TAB_ACTIVE_CLASSES : TAB_INACTIVE_CLASSES)}
            >
                {t('feed.following')}
            </NavLink>
        </div>
    )
}
export default MobileFeedTabs
