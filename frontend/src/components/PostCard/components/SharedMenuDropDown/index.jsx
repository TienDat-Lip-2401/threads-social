import { useRef, useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SharedMenuContent from './SharedMenuContent';

function SharedMenuDropDown({
    trigger,
    onCopyLink,
    onCopyAsImage,
    onGetEmbedCode,
}) {
    // State để track dropdown open/close
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    // Callback cho shadcn DropdownMenu
    const handleOpenChange = (open) => {
        setIsOpen(open); // Update state khi shadcn notify
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            {/* Trigger button được pass từ parent - InteractionBar */}
            <DropdownMenuTrigger asChild ref={triggerRef}>
                {trigger}
            </DropdownMenuTrigger>

            {/* Content của dropdown */}
            <DropdownMenuContent
                className='dropdown-menu-content mx-0! -mt-2! -mr-3!'
                align='end'
                sideOffset={12}
                alignOffset={-150}
            >
                {/* Main menu */}
                {isOpen && (
                    <SharedMenuContent
                        onCopyLink={onCopyLink}
                        onCopyAsImage={onCopyAsImage}
                        onGetEmbedCode={onGetEmbedCode}
                    />
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default SharedMenuDropDown;
