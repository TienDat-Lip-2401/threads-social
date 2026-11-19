import { cn } from '@/lib/utils';

function PostActionButton({
    src,
    alt,
    children,
    onClick,
    isActive = false,
    activeColor = '',
    ...props
}) {
    // 💡 CSS Filters cho các màu khác nhau
    const colorFilters = {
        'text-[#ff0034]':
            'brightness(0) saturate(100%) invert(11%) sepia(100%) saturate(7426%) hue-rotate(357deg) brightness(104%) contrast(114%)',
        'text-[#1d9bf0]':
            'brightness(0) saturate(100%) invert(52%) sepia(96%) saturate(2569%) hue-rotate(184deg) brightness(102%) contrast(92%)',
        // Thêm màu khác nếu cần...
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex min-w-[60px] items-center justify-center gap-1 rounded-xl px-2 py-1 hover:bg-gray-400/20 dark:text-white/90 dark:hover:bg-gray-700',
                isActive && activeColor,
            )}
            {...props}
        >
            <img
                src={src}
                alt={alt}
                className={cn(
                    'h-5 w-5 transition-all',
                    !isActive &&
                        'dark:opacity-88 dark:brightness-95 dark:invert',
                )}
                style={
                    isActive && activeColor
                        ? { filter: colorFilters[activeColor] || '' }
                        : {}
                }
            />
            <span
                className={cn(
                    'text-xs transition-colors',
                    isActive ? activeColor : 'dark:text-gray-400',
                )}
            >
                {children}
            </span>
        </button>
    );
}

export default PostActionButton;
