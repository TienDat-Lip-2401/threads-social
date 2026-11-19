import { useOutletContext } from 'react-router-dom';

import EmptyMessage from '../EmptyMessage';

// shortcut: tab Media chưa có API, luôn trống
function Media() {
    const { profile } = useOutletContext();
    // Hồ sơ người khác → câu trung tính thay vì "... của bạn"
    return (
        <EmptyMessage
            message={
                profile.is_me
                    ? 'profilePage.tabs.mediaNote'
                    : 'profilePage.tabs.mediaNoteOther'
            }
        />
    );
}
export default Media;
