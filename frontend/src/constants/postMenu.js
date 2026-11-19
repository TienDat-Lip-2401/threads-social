import bookMarkIcon from '@/assets/icons/bookmark-icon.svg'
import eyeOffIcon from '@/assets/icons/eyeoff-icon.svg'
import muteIcon from '@/assets/icons/mute-icon.svg'
import restrictIcon from '@/assets/icons/restrict-icon.svg'
import blockIcon from '@/assets/icons/block-icon.svg'
import reportIcon from '@/assets/icons/report-icon.svg'
import linkIcon from '@/assets/icons/link-icon.svg'

export const gettingPostMenuSections = (t) => [
    // Group 1
    {
        items: [
            {
                id: 'add-to-feed',
                label: t('postMenuContent.addFeed'),
                url: '#',
                hasArrow: true,
                action: 'openFeed' // ← Map action name to handler
            }
        ]
    },
    // Group 2
    {
        items: [
            {
                id: 'save',
                label: t('postMenuContent.save'),
                url: '#',
                icon: bookMarkIcon
            },
            {
                id: 'not-interested',
                label: t('postMenuContent.notInterested'),
                url: '#',
                icon: eyeOffIcon
            }
        ]
    },
    // Group 3
    {
        items: [
            {
                id: 'mute',
                label: t('postMenuContent.mute'),
                url: '#',
                icon: muteIcon
            },
            {
                id: 'restrict',
                label: t('postMenuContent.restrict'),
                url: '#',
                icon: restrictIcon
            },
            {
                id: 'block',
                label: t('postMenuContent.block'),
                url: '#',
                icon: blockIcon,
                isDanger: true
            },
            {
                id: 'report',
                label: t('postMenuContent.report'),
                url: '#',
                icon: reportIcon,
                isDanger: true
            }
        ]
    },
    // Group 4
    {
        items: [
            {
                id: 'copy-link',
                label: t('postMenuContent.copy'),
                url: '#',
                icon: linkIcon
            }
        ]
    }
]
