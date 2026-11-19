import { useOutletContext } from 'react-router-dom';

import { useProfileReposts } from '@/features/posts';
import { getUserReposts } from '@/services/posts';
import ProfilePostList from '../ProfilePostList';

// Tab Reposts: bài hồ sơ đang xem đã repost (repost mới nhất lên đầu)
function Reposts() {
    const { profile } = useOutletContext();
    const list = useProfileReposts();

    return (
        <ProfilePostList
            username={profile.username}
            list={list}
            fetchPage={getUserReposts}
            emptyMessage={
                profile.is_me
                    ? 'profilePage.tabs.repostsNote'
                    : 'profilePage.tabs.repostsNoteOther'
            }
            hideUnreposted={profile.is_me}
        />
    );
}
export default Reposts;
