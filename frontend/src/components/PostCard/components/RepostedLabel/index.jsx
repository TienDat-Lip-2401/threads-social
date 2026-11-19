import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import repostIcon from '@/assets/icons/repost-icon.svg';
import { useCurrentUser } from '@/features/auth';
import { useInteraction } from '@/features/posts';

// Feed: dòng nhỏ phía trên bài được repost "đẩy lên" (reposted_by từ API)
function RepostedLabel({ postId, repostedBy }) {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const interaction = useInteraction(postId);
    const isMe = currentUser?.id === repostedBy.id;

    // Mình vừa gỡ repost ngay trên feed → ẩn dòng "Bạn đã đăng lại"
    if (isMe && interaction?.isReposted === false) return null;

    return (
        <div className='flex items-center gap-1.5 px-4 pb-1 pl-[34px] text-xs text-gray-500'>
            <img
                src={repostIcon}
                alt='reposted'
                className='h-3.5 w-3.5 opacity-60 dark:invert'
            />
            {isMe ? (
                <span>{t('repostedLabel.me')}</span>
            ) : (
                <span>
                    <Link
                        to={`/profile/${encodeURIComponent(repostedBy.username)}`}
                        onClick={(e) => e.stopPropagation()}
                        className='font-medium hover:underline'
                    >
                        {repostedBy.username}
                    </Link>{' '}
                    {t('repostedLabel.other')}
                </span>
            )}
        </div>
    );
}

export default RepostedLabel;
