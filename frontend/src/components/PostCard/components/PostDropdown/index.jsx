import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import PostMenuContent from './PostMenuContent'
import FeedSubmenu from './FeedSubmenu'

function PostDropdown({ trigger, align = 'end' }) {
    // State để track dropdown open/close
    const [isOpen, setIsOpen] = useState(false)
    const [currentView, setCurrentView] = useState('main')

    // Callback cho shadcn DropdownMenu
    const handleOpenChange = (open) => {
        setIsOpen(open) // Update state khi shadcn notify
        if (!open) setCurrentView('main')
    }

    // Navigation handlers
    const handleFeedClick = () => setCurrentView('feed')
    const handleBack = () => setCurrentView('main')

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            {/* Trigger button được pass từ parent */}
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

            {/* Content của dropdown */}
            <DropdownMenuContent className='dropdown-menu-content mx-0! -mt-2! -mr-3!' align={align}>
                {/* Main menu - truyền handler cho submenu nếu cần */}
                {currentView === 'main' && <PostMenuContent onFeedClick={handleFeedClick} />}

                {/* Feeds submenu */}
                {currentView === 'feed' && <FeedSubmenu onBack={handleBack} />}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default PostDropdown
