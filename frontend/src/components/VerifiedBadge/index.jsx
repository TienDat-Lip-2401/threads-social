import verifiedIcon from '@/assets/icons/verified-icon.svg';

// Icon tích xanh cạnh username (verified từ API). className để chỉnh kích thước.
function VerifiedBadge({ verified, className = 'h-3 w-3' }) {
    if (!verified) return null;
    return (
        <img
            src={verifiedIcon}
            alt='verified icon'
            className={`inline-block shrink-0 ${className}`}
        />
    );
}

export default VerifiedBadge;
