import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

const TAB_BASE_CLASSES =
    'flex-1 px-4 py-2 text-center text-base md:text-sm transition-colors block';
const TAB_ACTIVE_CLASSES =
    'border-b border-black font-medium text-black dark:border-white dark:text-white';
const TAB_INACTIVE_CLASSES =
    'border-b border-gray-400/50 font-normal text-gray-500 dark:text-gray-500';

function NavigationTabs() {
    const { t } = useTranslation();

    return (
        <nav>
            <ul className='flex justify-around'>
                <li className='flex-1'>
                    <NavLink
                        to={ROUTES.PROFILE}
                        end // Chỉ active khi exact /profile
                        className={({ isActive }) =>
                            cn(
                                TAB_BASE_CLASSES,
                                isActive
                                    ? TAB_ACTIVE_CLASSES
                                    : TAB_INACTIVE_CLASSES,
                            )
                        }
                    >
                        {t('profilePage.tabs.threads')}
                    </NavLink>
                </li>
                <li className='flex-1'>
                    <NavLink
                        to={ROUTES.REPLIES}
                        className={({ isActive }) =>
                            cn(
                                TAB_BASE_CLASSES,
                                isActive
                                    ? TAB_ACTIVE_CLASSES
                                    : TAB_INACTIVE_CLASSES,
                            )
                        }
                    >
                        {t('profilePage.tabs.replies')}
                    </NavLink>
                </li>
                <li className='flex-1'>
                    <NavLink
                        to={ROUTES.MEDIA}
                        className={({ isActive }) =>
                            cn(
                                TAB_BASE_CLASSES,
                                isActive
                                    ? TAB_ACTIVE_CLASSES
                                    : TAB_INACTIVE_CLASSES,
                            )
                        }
                    >
                        {t('profilePage.tabs.media')}
                    </NavLink>
                </li>
                <li className='flex-1'>
                    <NavLink
                        to={ROUTES.REPOSTS}
                        className={({ isActive }) =>
                            cn(
                                TAB_BASE_CLASSES,
                                isActive
                                    ? TAB_ACTIVE_CLASSES
                                    : TAB_INACTIVE_CLASSES,
                            )
                        }
                    >
                        {t('profilePage.tabs.reposts')}
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}
export default NavigationTabs;
