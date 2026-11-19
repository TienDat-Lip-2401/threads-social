import repostIcon from '@/assets/icons/repost-icon.svg';
import quoteIcon from '@/assets/icons/quote-icon.svg';

// isReposted: đã repost → mục đầu thành "Gỡ đăng lại"
export const gettingRepostMenuSection = (t, isReposted = false) => [
    {
        items: [
            {
                id: 'copy-link',
                label: isReposted
                    ? t('threadModal.repostMenu.removeRepost')
                    : t('threadModal.repostMenu.repost'),
                url: '#',
                action: 'repost', // ← Map action name to handler
                icon: repostIcon,
            },
            {
                id: 'copy-image',
                label: t('threadModal.repostMenu.quote'),
                url: '#',
                action: 'quote',
                icon: quoteIcon,
            },
        ],
    },
];
