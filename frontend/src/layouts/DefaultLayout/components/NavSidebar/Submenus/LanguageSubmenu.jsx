import { useTranslation } from 'react-i18next'
import { IoArrowBack } from 'react-icons/io5'
import { RiGlobalLine } from 'react-icons/ri'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Check } from 'lucide-react'

import MenuItem from '../../../../../components/MenuItem'

const languages = [
    {
        code: 'en',
        name: 'English'
    },
    {
        code: 'vi',
        name: 'Tiếng Việt'
    }
]

function LanguageSubmenu({ onBack }) {
    const { i18n, t } = useTranslation()

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode)
        localStorage.setItem('language', langCode)
    }

    return (
        <>
            <div className='relative'>
                {/* Header: Back button + Title + Add button */}
                <div className='flex items-center justify-between py-2.5'>
                    <button onClick={onBack} className='absolute left-0 p-2'>
                        <IoArrowBack size={18} />
                    </button>

                    <h2 className='ml-10 text-sm font-semibold'>{t('settings.languages')}</h2>

                    <RiGlobalLine size={16} className='mr-1.5' />
                </div>

                <DropdownMenuSeparator className='-mx-2 my-2 bg-gray-300 dark:bg-gray-500/20' />

                {/* Feed options */}
                <div className='space-y-1'>
                    {languages.map((lang) => (
                        <MenuItem
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            icon={
                                i18n.language === lang.code && (
                                    <Check size={16} className='text-black dark:text-white' />
                                )
                            }
                        >
                            <span>{lang.name}</span>
                        </MenuItem>
                    ))}
                </div>
            </div>
        </>
    )
}
export default LanguageSubmenu
