import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';

import ProfileHeader from './components/ProfileHeader';
import NavigationTabs from './components/NavigationTabs';
import EditProfileModal from './components/EditProfileModal';
import { ROUTES } from '@/constants';
import { useCurrentUser } from '@/features/auth';
import { getUserPosts } from '@/services/posts';
import { getUserProfile } from '@/services/users';

// /profile → hồ sơ của mình, /profile/:username → hồ sơ người khác
function Profile() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { username: paramUsername } = useParams();
    const currentUser = useCurrentUser();
    const username = paramUsername || currentUser?.username;

    const [profile, setProfile] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | ok | notFound | error
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        if (!username) return;
        let ignore = false;
        setStatus('loading');
        getUserProfile(username)
            .then((data) => {
                if (ignore) return;
                setProfile(data);
                setStatus('ok');
            })
            .catch((error) => {
                if (ignore) return;
                setStatus(
                    error.response?.status === 404 ? 'notFound' : 'error',
                );
            });
        return () => {
            ignore = true;
        };
        // currentUser?.id: đăng nhập/đăng xuất → tải lại để is_me đúng
    }, [username, currentUser?.id]);

    // Sửa hồ sơ xong: cập nhật header ngay + tải lại bài để avatar/tên mới hiện trên bài
    const handleProfileSaved = useCallback(
        (user) => {
            setProfile((prev) => ({
                ...prev,
                name: user.name,
                bio: user.bio,
                avatar_url: user.avatar_url,
            }));
            dispatch(getUserPosts({ username: user.username, page: 1 }));
        },
        [dispatch],
    );

    // Vào /profile khi chưa đăng nhập
    if (!username) {
        return (
            <div className='home-wrapper'>
                <div className='posts-container py-10 text-center text-sm text-gray-500'>
                    <p>{t('profilePage.loginRequired')}</p>
                    <Link
                        to={ROUTES.LOGIN}
                        className='mt-2 inline-block font-semibold underline'
                    >
                        {t('auth.loginNow')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='home-wrapper'>
            <div className='posts-container divide-none py-4'>
                {status === 'loading' && (
                    <div className='flex justify-center py-10'>
                        <LoaderCircle className='h-6 w-6 animate-spin text-gray-500' />
                    </div>
                )}

                {(status === 'notFound' || status === 'error') && (
                    <p className='py-10 text-center text-sm text-gray-500'>
                        {status === 'notFound'
                            ? t('profilePage.notFound')
                            : t('profilePage.loadError')}
                    </p>
                )}

                {status === 'ok' && profile && (
                    <>
                        {/* Profile Header */}
                        <ProfileHeader
                            profile={profile}
                            onEditProfile={() => setIsEditOpen(true)}
                        />

                        {/* Profile Navigation Tabs */}
                        <NavigationTabs />

                        <Outlet context={{ profile }} />

                        {profile.is_me && (
                            <EditProfileModal
                                open={isEditOpen}
                                onOpenChange={setIsEditOpen}
                                profile={profile}
                                onSaved={handleProfileSaved}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
export default Profile;
