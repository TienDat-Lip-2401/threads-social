import { useOutletContext } from 'react-router-dom';

import PostComposer from '@/components/PostComposer';
import { useProfilePosts } from '@/features/posts';
import { getUserPosts } from '@/services/posts';
import ProfilePostList from '../ProfilePostList';

// Tab Threads: bài của hồ sơ đang xem
function Threads() {
    const { profile } = useOutletContext();
    const list = useProfilePosts();

    return (
        <ProfilePostList
            username={profile.username}
            list={list}
            fetchPage={getUserPosts}
            emptyMessage='profilePage.tabs.threadsNote'
            header={
                profile.is_me && (
                    <div className='border-b border-gray-400/50 py-1'>
                        <PostComposer />
                    </div>
                )
            }
        />
    );
}
export default Threads;
