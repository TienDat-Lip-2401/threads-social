import { useState } from 'react'
import { HiOutlineBars3BottomRight } from 'react-icons/hi2'

import { cn } from '@/lib/utils'
import SettingsMenuContent from '../NavSidebar/NavDropdown'

function MenuButton() {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false)

    return (
        <SettingsMenuContent
            isOpen={isOpenDropdown}
            onDropdownToggle={setIsOpenDropdown}
            align='end'
            alignOffset={-100}
            trigger={
                <button type='button' className='absolute top-2 right-4 p-2 outline-none'>
                    <HiOutlineBars3BottomRight
                        size={30}
                        className={cn('text-gray-400 dark:text-white', isOpenDropdown && 'text-black')}
                    />
                </button>
            }
        />
    )
}
export default MenuButton
