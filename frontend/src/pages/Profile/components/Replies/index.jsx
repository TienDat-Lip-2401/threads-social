import { useOutletContext } from 'react-router-dom';

import { useProfileReplies } from '@/features/posts';
import { getUserReplies } from '@/services/posts';
import QuotedPostCard from '@/components/QuotedPostCard';
import ReplyItem from '@/components/BaseThreadModal/components/ReplyItem';
import ProfilePostList from '../ProfilePostList';

// Tab Replies: comment của hồ sơ đang xem (mới nhất lên đầu), mỗi comment kèm thẻ bài gốc
// shortcut: chưa like / trả lời tiếp comment ở đây, bấm bài gốc chưa mở trang chi tiết
function Replies() {
    const { profile } = useOutletContext();
    const list = useProfileReplies();

    const renderReply = (reply) => (
        <div
            key={reply.id}
            className='border-b border-gray-300 py-3 dark:border-gray-500/30'
        >
            <div className='px-6 pb-3'>
                <QuotedPostCard
                    post={{
                        ...reply.post,
                        is_quote: !!reply.post.quoted_post_id,
                    }}
                />
            </div>
            <ReplyItem reply={reply} showToolbar={false} />
        </div>
    );

    return (
        <ProfilePostList
            username={profile.username}
            list={list}
            fetchPage={getUserReplies}
            emptyMessage={
                profile.is_me
                    ? 'profilePage.tabs.repliesNote'
                    : 'profilePage.tabs.repliesNoteOther'
            }
            renderItem={renderReply}
        />
    );
}
export default Replies;
