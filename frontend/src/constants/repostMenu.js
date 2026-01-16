import repostIcon from '@/assets/icons/repost-icon.svg';
import quoteIcon from '@/assets/icons/quote-icon.svg';

export const gettingRepostMenuSection = (t) => [
    {
        items: [
            {
                id: 'copy-link',
                label: t('threadModal.repostMenu.repost'),
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
