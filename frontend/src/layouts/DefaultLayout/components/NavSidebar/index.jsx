/**
 * NavSidebar Component -  Sidebar navigation cố định bên trái màn hình
 * Structure sử dụng flexbox để tự động spacing:
 * - flex-shrink-0: Logo và bottom icons không bị shrink
 * - flex-1: Center nav chiếm toàn bộ space còn lại
 */

import { Link } from 'react-router-dom';
import { useState } from 'react';

import { ROUTES } from '@/constants';
import threadsLogo from '@/assets/images/threads-logo.svg';
import { NAV_ITEMS } from '@/constants';
import BottomActions from './BottomAction';
import NavItem from './NavItem';
import NewThreadModal from '@/components/BaseThreadModal/NewThreadModal';
import LoginAlertDialog from '@/components/LoginAlertDialog';

function NavSidebar() {
    // State quản lý dropdown menu mở/đóng
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);

    return (
        <div className='nav-wrapper'>
            {/* Logo (TOP) - Ẩn trên mobile */}
            <div className='nav-section'>
                <Link to={ROUTES.HOME}>
                    <img src={threadsLogo} alt='logo' className='w-[34px]' />
                </Link>
            </div>

            {/*  SECTION 2: Navigation Items (CENTER) - flex-1 → chiếm toàn bộ khoảng trống */}
            <nav className='nav-container'>
                <ul className='nav-list'>
                    {NAV_ITEMS.map((item) => (
                        <li key={item.id} className='nav-item'>
                            <NavItem
                                item={item}
                                onCreateThread={() => setIsModalOpen(true)}
                                onAuthRequired={() => setIsLoginAlertOpen(true)}
                            />
                        </li>
                    ))}
                </ul>
            </nav>

            {/* SECTION 3: Bottom Actions (BOTTOM) - shrink-0 → không bị co lại, luôn nằm dưới cùng */}
            <div className='nav-section'>
                <BottomActions
                    isDropdownOpen={isDropdownOpen}
                    onDropdownToggle={setIsDropdownOpen}
                />
            </div>

            {/* New Thread Modal */}
            <NewThreadModal
                isOpenModal={isModalOpen}
                setIsOpenModal={setIsModalOpen}
            />

            {/* 💡 Login Alert Dialog */}
            <LoginAlertDialog
                isOpen={isLoginAlertOpen}
                onClose={setIsLoginAlertOpen}
            />
        </div>
    );
}

export default NavSidebar;
