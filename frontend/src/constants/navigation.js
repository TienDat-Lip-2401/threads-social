import { GoHomeFill } from 'react-icons/go';
import { LuSearch, LuPlus, LuHeart } from 'react-icons/lu';
import { FaRegUser } from 'react-icons/fa6';

const NAV_ITEMS = [
    {
        id: 'home',
        url: '/',
        icon: GoHomeFill,
        iconSize: 22,
        hasWhiteText: true,
        requiresAuth: false, // Public - không cần login
    },
    {
        id: 'search',
        url: '/search',
        icon: LuSearch,
        iconSize: 22,
        requiresAuth: false, // Public
    },
    {
        id: 'create',
        url: '#',
        icon: LuPlus,
        iconSize: 22,
        isSpecial: true, // Plus button has special behavior
        requiresAuth: true, // Cần login để tạo post
    },
    {
        id: 'activity',
        url: '/activity',
        icon: LuHeart,
        iconSize: 22,
        requiresAuth: true, // Cần login để xem activity
    },
    {
        id: 'profile',
        url: '/profile',
        icon: FaRegUser,
        iconSize: 22,
        requiresAuth: true, // Cần login để xem profile
    },
];

export default NAV_ITEMS;
