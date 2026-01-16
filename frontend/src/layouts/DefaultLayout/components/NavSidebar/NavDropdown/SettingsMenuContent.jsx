/**
 * SettingsMenuContent Component
 *
 * Main dropdown menu content cho NavSidebar settings button.
 * Hiển thị menu khác nhau tùy theo authentication status:
 * - Authenticated users: MenuSections với 3 groups (Settings, Content, Actions)
 * - Guest users: Simple menu với 2 items (Appearance, Report)
 *
 * @param {Function} onFeedsClick - Callback khi user click "Feeds" menu item
 * @param {Function} onAppearanceClick - Callback khi user click "Appearance" menu item
 * @param {Function} onLanguageChange - Callback khi user click "Settings" menu item
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

import MenuItem from '@/components/MenuItem';
import {
    getGuestMenuItems,
    getSettingsMenuSections,
} from '@/constants/navMenuItems';
import MenuSections from '@/components/MenuSections';
import { logoutUser } from '@/services/auth';
import { clearTokens } from '@/utils/authStorage';
import { logout, useIsAuthenticated } from '@/features/auth';
import { ROUTES } from '@/constants';

function SettingsMenuContent({
    onFeedsClick,
    onAppearanceClick,
    onLanguageChange,
}) {
    const isAuthenticated = useIsAuthenticated();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // ✅ Vẫn logout ở client dù API fail
            clearTokens(); // Xóa tokens khỏi localStorage

            dispatch(logout()); // Reset Redux state về initial

            navigate(ROUTES.LOGIN, { replace: true }); //  Redirect về login page
        }
    };

    // Map actions từ menu items đến callback handlers
    const actionHandlers = {
        openAppearance: onAppearanceClick,
        openLanguage: onLanguageChange,
        openFeeds: onFeedsClick,
        logout: handleLogout,
    };

    // Nếu đã login -> Render menu cho user đã đăng nhập
    if (isAuthenticated) {
        const sections = getSettingsMenuSections(t);
        return (
            <MenuSections
                groupedMenu={sections}
                actionHandlers={actionHandlers}
            />
        );
    }

    // Ngược lại render menu cho guest
    const guestItems = getGuestMenuItems(t);
    return guestItems.map((item, index) => (
        <React.Fragment key={index}>
            <div>
                <MenuItem
                    hasArrow={item.hasArrow}
                    onClick={
                        item.action ? actionHandlers[item.action] : undefined
                    }
                >
                    {item.label}
                </MenuItem>
            </div>

            {/* Separator giữa guest items */}
            {index < guestItems.length - 1 && (
                <DropdownMenuSeparator className='-mx-2 my-1.5 bg-gray-300 dark:bg-gray-500/20' />
            )}
        </React.Fragment>
    ));
}

export default SettingsMenuContent;
