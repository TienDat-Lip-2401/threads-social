import linkIcon from '@/assets/icons/link-icon.svg';
import photoIcon from '@/assets/icons/photo-icon.svg';
import embedCodeIcon from '@/assets/icons/embed-code-icon.svg';

export const gettingSharedMenuSection = (t) => [
    {
        items: [
            {
                id: 'copy-link',
                label: t('threadModal.sharedMenu.copyLink'),
                url: '#',
                action: 'copyLink', // ← Map action name to handler
                icon: linkIcon,
            },
            {
                id: 'copy-image',
                label: t('threadModal.sharedMenu.copyImage'),
                url: '#',
                action: 'copyImage',
                icon: photoIcon,
            },
            {
                id: 'get-embed-code',
                label: t('threadModal.sharedMenu.getEmbedCode'),
                url: '#',
                action: 'getEmbedCode',
                icon: embedCodeIcon,
            },
        ],
    },
];
