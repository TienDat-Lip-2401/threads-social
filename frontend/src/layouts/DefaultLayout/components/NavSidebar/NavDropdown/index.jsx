/**
 * NavDropdown Component
 *
 * Container quản lý dropdown navigation menu trong NavSidebar.
 *
 * Features:
 * - Quản lý view routing giữa main menu và submenus
 * - Auto-reset về main menu khi dropdown đóng
 * - Coordinated state với parent NavSidebar
 *
 * Views:
 * - main: SettingsMenuContent (default view)
 * - feeds: FeedsSubmenu
 * - appearance: AppearanceSubmenu
 * - language: LanguageSubmenu
 *
 */

import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import FeedsSubmenu from '../Submenus/FeedsSubmenu';
import AppearanceSubmenu from '../Submenus/AppearanceSubmenu';
import LanguageSubmenu from '../Submenus/LanguageSubmenu';
import SettingsMenuContent from './SettingsMenuContent';

function NavDropdown({
    isOpen,
    onDropdownToggle,
    trigger,
    align = '',
    sideOffset = 0,
    alignOffset = 0,
}) {
    // State quản lý view hiện tại (main hoặc feeds)
    const [currentView, setCurrentView] = useState('main');

    // Callback cho shadcn DropdownMenu, nhận boolean từ shadcn:
    // - Cập nhật state ở NavSidebar
    // - Reset về main menu khi đóng
    const handleOpenChange = (open) => {
        onDropdownToggle(open);
        if (!open) setCurrentView('main');
    };

    // Navigation handlers
    const handleFeedsClick = () => setCurrentView('feeds');
    const handleAppearanceClick = () => setCurrentView('appearance');
    const handleLanguageChange = () => setCurrentView('language');
    const handleBack = () => setCurrentView('main');

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            {/* Luôn cần trigger để positioning đúng */}
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

            {/* Content của dropdown */}
            <DropdownMenuContent
                className='dropdown-menu-content'
                align={align}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
            >
                {/* View routing - Conditional rendering dựa trên currentView */}
                {currentView === 'main' && (
                    <SettingsMenuContent
                        onFeedsClick={handleFeedsClick}
                        onAppearanceClick={handleAppearanceClick}
                        onLanguageChange={handleLanguageChange}
                    />
                )}
                {currentView === 'feeds' && (
                    <FeedsSubmenu onBack={handleBack} />
                )}

                {currentView === 'appearance' && (
                    <AppearanceSubmenu onBack={handleBack} />
                )}

                {currentView === 'language' && (
                    <LanguageSubmenu onBack={handleBack} />
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NavDropdown;
