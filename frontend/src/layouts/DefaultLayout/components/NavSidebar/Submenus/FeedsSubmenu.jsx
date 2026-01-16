/**
 * FeedsSubmenu Component
 *
 * Hiển thị submenu khi user click vào "Feeds" trong dropdown menu
 * Bao gồm:
 * - Header với nút back, title "Feeds", và nút add
 * - Danh sách các feed options: For you, Following, Ghost posts
 */

import { IoArrowBack } from 'react-icons/io5'
import { FiPlusCircle } from 'react-icons/fi'
import { TbGhost2 } from 'react-icons/tb'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

import MenuItem from '@/components/MenuItem'
import { useTranslation } from 'react-i18next'

function FeedsSubmenu({ onBack }) {
    const { t } = useTranslation()

    return (
        <>
            <div className='relative'>
                {/* Header: Back button + Title + Add button */}
                <div className='flex items-center justify-between py-2'>
                    <button onClick={onBack} className='absolute left-0 p-2'>
                        <IoArrowBack size={18} />
                    </button>

                    <h2 className='ml-10 text-sm font-semibold'>{t('feeds.title')}</h2>

                    <button className='rounded-lg p-2 transition-all hover:scale-110 hover:bg-transparent'>
                        <FiPlusCircle size={16} />
                    </button>
                </div>

                <DropdownMenuSeparator className='-mx-2 my-2 bg-gray-300 dark:bg-gray-500/20' />

                {/* Feed options */}
                <div className='space-y-1'>
                    <MenuItem>{t('feeds.forYou')}</MenuItem>
                    <MenuItem>{t('feeds.following')}</MenuItem>

                    {/* Ghost posts with arrow & icon */}
                    <MenuItem icon={<TbGhost2 size={20} className='text-gray-700 dark:text-white' />}>
                        {t('feeds.ghostPosts')}
                    </MenuItem>
                </div>
            </div>
        </>
    )
}

export default FeedsSubmenu
