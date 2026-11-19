import { useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RepostMenuContent from './RepostMenuContent';

function RepostMenuDropDown({ trigger, isReposted, onRepost, onQuote }) {
    // State để track dropdown open/close
    const [isOpen, setIsOpen] = useState(false);

    // Callback cho shadcn DropdownMenu
    const handleOpenChange = (open) => {
        setIsOpen(open); // Update state khi shadcn notify
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            {/* Trigger button được pass từ parent - InteractionBar */}
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

            {/* Content của dropdown */}
            <DropdownMenuContent
                className='dropdown-menu-content mx-0! -mt-2! -mr-3!'
                align='end'
                sideOffset={12}
                alignOffset={-150}
            >
                {/* Main menu */}
                {isOpen && (
                    <RepostMenuContent
                        isReposted={isReposted}
                        onRepost={onRepost}
                        onQuote={onQuote}
                    />
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default RepostMenuDropDown;
