import { useOutletContext } from 'react-router-dom';

import EmptyMessage from '../EmptyMessage';

// shortcut: tab Replies chưa có API, luôn trống
function Replies() {
    const { profile } = useOutletContext();
    // Hồ sơ người khác → câu trung tính thay vì "... của bạn"
    return (
        <EmptyMessage
            message={
                profile.is_me
                    ? 'profilePage.tabs.repliesNote'
                    : 'profilePage.tabs.repliesNoteOther'
            }
        />
    );
}
export default Replies;
