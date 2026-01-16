/**
 * MenuSections: Hiển thị groups of menu items với separator
 * Sử dụng MenuItem component
 */

import React from 'react'
import { DropdownMenuSeparator } from '../ui/dropdown-menu'

import MenuItem from '../MenuItem'

function MenuSections({ groupedMenu, actionHandlers = {} }) {
    return groupedMenu.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
            <div className='space-y-1'>
                {group.items.map((item, itemIndex) => (
                    <MenuItem
                        key={itemIndex}
                        hasArrow={item.hasArrow}
                        isDanger={item.isDanger}
                        icon={item.icon}
                        onClick={item.action ? actionHandlers[item.action] : undefined}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </div>

            {/* Separator giữa các groups */}
            {groupIndex < groupedMenu.length - 1 && (
                <DropdownMenuSeparator className='-mx-2 my-2 bg-gray-300 dark:bg-gray-500/20' />
            )}
        </React.Fragment>
    ))
}
export default MenuSections
