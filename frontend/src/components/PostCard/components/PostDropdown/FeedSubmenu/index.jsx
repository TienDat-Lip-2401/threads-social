import { IoArrowBack } from 'react-icons/io5'
import { FiPlusCircle } from 'react-icons/fi'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

import MenuItem from '@/components/MenuItem'
import { useTranslation } from 'react-i18next'

function FeedSubmenu({ onBack }) {
    const { t } = useTranslation()

    return (
        <>
            <div className='relative'>
                {/* Header: Back button + Title */}
                <div className='flex items-center justify-between py-2'>
                    <button onClick={onBack} className='absolute left-0 p-2'>
                        <IoArrowBack size={18} />
                    </button>

                    <h2 className='ml-10 text-sm font-semibold'>{t('postMenuContent.addFeed')}</h2>
                </div>

                <DropdownMenuSeparator className='-mx-2 my-2 bg-gray-300 dark:bg-gray-500/20' />

                {/* Feed options */}
                <div className='space-y-1'>
                    <MenuItem icon={<FiPlusCircle size={16} className='text-gray-700 dark:text-white' />}>
                        {t('postMenuContent.createFeed')}
                    </MenuItem>
                </div>
            </div>
        </>
    )
}

export default FeedSubmenu
