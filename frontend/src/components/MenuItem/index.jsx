/**
 * MenuItem Component: tái sử dụng cho các menu item trong dropdown
 * Features:
 * - Hiển thị text/content
 * - Optional: mũi tên bên phải (cho submenu)
 * - Optional: màu đỏ (cho danger actions như Log out)
 * - Xử lý khi user click vào item:
 *    1. Nếu item có arrow (submenu) → e.preventDefault() để dropdown KHÔNG đóng
*     2. Nếu không có arrow → dropdown đóng bình thường
*     3. Luôn gọi onClick callback (nếu có)
 
 */

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { IoChevronForward } from 'react-icons/io5';

import { cn } from '@/lib/utils';

function MenuItem({
    children,
    hasArrow = false,
    isDanger = false,
    icon,
    onClick,
}) {
    const handleClick = (e) => {
        // Prevent close dropdown nếu đây là submenu item
        if (hasArrow) e.preventDefault();

        // Trigger onClick callback
        if (onClick) onClick();
    };

    const renderIcon = () => {
        if (!icon) return null;

        // Nếu icon là string (SVG path từ import), render <img>
        if (typeof icon === 'string') {
            return <img src={icon} alt='' className='h-5 w-5 dark:invert' />;
        }

        // Nếu icon là React component (từ react-icons), render trực tiếp
        return <span className='text-gray-400'>{icon}</span>;
    };

    return (
        <DropdownMenuItem
            className={cn(
                // Base styles
                'dropdown-item',
                isDanger && 'dropdown-item__danger',
            )}
            onSelect={handleClick} // Dùng onSelect thay vì onClick (shadcn/ui pattern)
        >
            {/* Nội dung chính */}
            <span className='flex items-center gap-2 text-sm'>{children}</span>

            {/* {icon && <span className='text-gray-400'>{icon}</span>}
            {hasArrow && <IoChevronForward size={20} className='text-gray-400' />} */}

            {/* Icon hoặc arrow */}
            <div className='flex items-center gap-2'>
                {/* Icon bên phải */}
                {renderIcon()}

                {/* Mũi tên bên phải (nếu có) */}
                {hasArrow && (
                    <IoChevronForward size={20} className='text-gray-400' />
                )}
            </div>
        </DropdownMenuItem>
    );
}

export default MenuItem;
