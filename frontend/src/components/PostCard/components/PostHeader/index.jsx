import { timeStamp } from '@/utils/timeStamp';
import verifiedIcon from '@/assets/icons/verified-icon.svg';

function PostHeader({ username, timeAgo, verified = false }) {
    return (
        <div className='flex items-center gap-2'>
            <span className='text-xs font-medium'>{username}</span>

            {verified && (
                <span>
                    <img
                        src={verifiedIcon}
                        alt='verified icon'
                        className='h-3 w-3'
                    />
                </span> // Hoặc icon verified
            )}

            <span className='text-xs font-light whitespace-nowrap text-gray-400'>
                {timeStamp(timeAgo)}
            </span>
        </div>
    );
}

export default PostHeader;
