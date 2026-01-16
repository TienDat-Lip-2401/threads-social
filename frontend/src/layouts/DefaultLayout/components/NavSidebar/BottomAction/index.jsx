import { BsPin } from 'react-icons/bs';
import { HiOutlineBars3BottomLeft } from 'react-icons/hi2';

import { cn } from '@/lib/utils';
import NavDropdown from '../NavDropdown';
import { useIsAuthenticated } from '@/features/auth';

/**
 * BottomActions Component
 *
 * Bottom section của NavSidebar với:
 * - Pin button (guest only)
 * - Settings dropdown menu
 */
function BottomActions({ isDropdownOpen, onDropdownToggle }) {
    const isAuthenticated = useIsAuthenticated();

    return (
        <ul>
            {/* Pin button - only for guests */}
            {!isAuthenticated && (
                <li>
                    <button className='nav-btn__bottom'>
                        <BsPin size={22} />
                    </button>
                </li>
            )}

            {/* Settings dropdown */}
            {/* Pass trigger vào SettingsMenuContent */}
            {/* Dropdown Menu Component - Được trigger bởi button Menu icon*/}
            <li>
                <NavDropdown
                    isOpen={isDropdownOpen}
                    onDropdownToggle={onDropdownToggle}
                    trigger={
                        <button
                            className={cn(
                                'nav-btn__bottom setting-btn',
                                isDropdownOpen && 'text-black dark:text-white',
                            )}
                        >
                            <HiOutlineBars3BottomLeft size={22} />
                        </button>
                    }
                    sideOffset={8}
                />
            </li>
        </ul>
    );
}

export default BottomActions;
