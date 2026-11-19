import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getFollowList } from '@/services/users';
import FollowUserRow from './FollowUserRow';

const TABS = ['followers', 'following'];
const EMPTY = { items: [], page: 0, hasMore: true, isLoading: false };

// Modal "Người theo dõi / Đang theo dõi" của 1 hồ sơ. Danh sách là state cục bộ (không vào Redux),
// mở lại modal / đổi tab → tải lại từ trang 1. Nút theo dõi từng dòng dùng chung followsSlice.
function FollowListModal({ open, onOpenChange, profile, followersCount }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tab, setTab] = useState('followers');
    const [list, setList] = useState(EMPTY);
    // Callback ref: nội dung Dialog gắn vào DOM sau lần render đầu → cần render lại khi có phần tử
    const [sentinel, setSentinel] = useState(null);

    const counts = {
        followers: followersCount ?? 0,
        // shortcut: theo dõi / bỏ theo dõi trong modal ở hồ sơ của mình chưa cập nhật số này (tải lại trang mới đúng)
        following: profile.following_count ?? 0,
    };

    // Mỗi lần reset tăng key → bỏ response trễ của tab / hồ sơ trước
    const requestKey = useRef(0);

    // Mở modal / đổi tab → về trang 1
    useEffect(() => {
        if (!open) return;
        requestKey.current += 1;
        setList(EMPTY);
    }, [open, tab, profile.username]);

    // Tải trang tiếp khi danh sách vừa reset hoặc cuộn tới cuối
    const loadMore = () => {
        if (list.isLoading || !list.hasMore) return;
        const page = list.page + 1;
        const key = requestKey.current;
        setList((prev) => ({ ...prev, isLoading: true }));
        getFollowList(profile.username, tab, page)
            .then(({ data, pagination }) => {
                if (key !== requestKey.current) return;
                setList((prev) => {
                    const ids = new Set(prev.items.map((u) => u.id));
                    return {
                        items: [
                            ...prev.items,
                            ...data.filter((u) => !ids.has(u.id)),
                        ],
                        page: pagination.current_page,
                        hasMore: pagination.current_page < pagination.last_page,
                        isLoading: false,
                    };
                });
            })
            .catch(() => {
                if (key !== requestKey.current) return;
                setList((prev) => ({
                    ...prev,
                    isLoading: false,
                    hasMore: false,
                }));
            });
    };

    // Chạy lại sau mỗi lần render để loadMore luôn thấy state mới nhất
    useEffect(() => {
        if (!open || !sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => entries[0].isIntersecting && loadMore(),
            { rootMargin: '100px' },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    });

    const handleOpenUser = (username) => {
        onOpenChange(false);
        navigate(`/profile/${encodeURIComponent(username)}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='gap-0 p-0 sm:max-w-md'>
                <DialogHeader className='sr-only'>
                    <DialogTitle>
                        {t(`profilePage.followModal.${tab}`)}
                    </DialogTitle>
                    <DialogDescription>{profile.username}</DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <div className='flex border-b border-gray-300 pt-4 dark:border-gray-500/30'>
                    {TABS.map((key) => (
                        <button
                            key={key}
                            type='button'
                            onClick={() => setTab(key)}
                            className={cn(
                                '-mb-px flex-1 border-b py-3 text-sm',
                                tab === key
                                    ? 'border-black font-medium dark:border-white'
                                    : 'border-transparent text-gray-500',
                            )}
                        >
                            {t(`profilePage.followModal.${key}`)}
                            <span className='ml-1 text-gray-400'>
                                {counts[key]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Danh sách */}
                <div className='max-h-[60vh] min-h-48 overflow-y-auto py-1'>
                    {list.items.map((user) => (
                        <FollowUserRow
                            key={user.id}
                            user={user}
                            onOpenUser={handleOpenUser}
                        />
                    ))}

                    {!list.isLoading &&
                        !list.hasMore &&
                        list.items.length === 0 && (
                            <p className='py-10 text-center text-sm text-gray-500'>
                                {t(`profilePage.followModal.${tab}Empty`)}
                            </p>
                        )}

                    {list.isLoading && (
                        <div className='flex justify-center py-4'>
                            <LoaderCircle className='h-5 w-5 animate-spin text-gray-500' />
                        </div>
                    )}

                    <div ref={setSentinel} className='h-1' />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default FollowListModal;
