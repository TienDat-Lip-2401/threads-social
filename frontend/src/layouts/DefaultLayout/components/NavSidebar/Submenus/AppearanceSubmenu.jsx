/**
 * AppearanceSubmenu Component - Submenu cho Appearance settings
 * Cho phép user chọn theme: Light, Dark, hoặc Auto
 */

import { IoArrowBack } from 'react-icons/io5'
import { IoSunnyOutline } from 'react-icons/io5'
import { IoMoonOutline } from 'react-icons/io5'

import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

function AppearanceSubmenu({ onBack }) {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()

    return (
        <>
            <div className='appearance-container'>
                {/* Header: Back button + Title */}
                <div className='flex items-center justify-center'>
                    <button onClick={onBack} className='absolute left-0 p-2'>
                        <IoArrowBack size={18} />
                    </button>
                    <h2 className='text-xs font-semibold'> {t('appearance.title')}</h2>
                </div>

                {/* Theme Selector */}
                <div className='appearance-btns'>
                    {/* Light Theme Button */}
                    <button
                        onClick={() => setTheme('light')}
                        className={cn(
                            'appearance-btn',
                            theme === 'light' ? 'appearance-btn--active' : 'appearance-btn--inactive'
                        )}
                    >
                        <IoSunnyOutline size={16} />
                    </button>

                    {/* Dark Theme Button */}
                    <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                            'appearance-btn',
                            theme === 'dark' ? 'appearance-btn--active' : 'appearance-btn--inactive'
                        )}
                    >
                        <IoMoonOutline size={16} />
                    </button>

                    {/* Auto Theme Button */}
                    <button
                        onClick={() => setTheme('system')}
                        className={cn(
                            'appearance-btn',
                            theme === 'system' ? 'appearance-btn--active' : 'appearance-btn--inactive'
                        )}
                    >
                        <span className='text-xs font-medium whitespace-nowrap'>{t('appearance.auto')}</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default AppearanceSubmenu
