import { useOutletContext } from 'react-router-dom';

import { useProfileMedia } from '@/features/posts';
import { getUserMedia } from '@/services/posts';
import ProfilePostList from '../ProfilePostList';

// Tab Media: bài của hồ sơ đang xem có ảnh (mới nhất lên đầu)
// shortcut: ảnh trong comment chưa tính
function Media() {
    const { profile } = useOutletContext();
    const list = useProfileMedia();

    return (
        <ProfilePostList
            username={profile.username}
            list={list}
            fetchPage={getUserMedia}
            emptyMessage={
                profile.is_me
                    ? 'profilePage.tabs.mediaNote'
                    : 'profilePage.tabs.mediaNoteOther'
            }
        />
    );
}
export default Media;
