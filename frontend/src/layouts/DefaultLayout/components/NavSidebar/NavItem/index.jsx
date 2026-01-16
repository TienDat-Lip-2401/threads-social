/**
 * NavItem Component
 *
 * Individual navigation item với support cho:
 * - Regular links (NavLink)
 * - Action buttons (onClick handler)
 * - Special styling (Plus button, Home button)
 */

import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useIsAuthenticated } from '@/features/auth';

function NavItem({ item, onCreateThread, onAuthRequired }) {
    const Icon = item.icon;
    const iconElement = <Icon size={item.iconSize} />;

    const isAuthenticated = useIsAuthenticated();

    // Handle click với auth check
    const handleClick = (e) => {
        // Blur button để remove focus
        e.currentTarget.blur();

        // Nếu item cần auth mà user chưa login → show dialog
        if (item.requiresAuth && !isAuthenticated) {
            e.preventDefault(); // Ngăn navigation
            onAuthRequired(); // Trigger auth dialog
            return;
        }
    };

    // Special case:  Plus button -> Create new Threads post
    if (item.id === 'create') {
        return (
            <button
                onClick={(e) => {
                    e.currentTarget.blur();
                    onCreateThread();
                }}
                className={cn('nav-btn', item.isSpecial && 'plus-btn')}
            >
                {iconElement}
            </button>
        );
    }

    // Regular navigation link
    return (
        <NavLink
            to={item.url}
            onClick={handleClick}
            className={({ isActive }) =>
                cn(
                    'nav-btn',
                    item.hasWhiteText && isActive && 'home-btn',
                    isActive && 'nav-btn__active',
                )
            }
        >
            {iconElement}
        </NavLink>
    );
}

export default NavItem;
