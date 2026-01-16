/**
 * Menu items cho NavSidebar Settings Dropdown
 */

// Authenticated user menu sections
export const getSettingsMenuSections = (t) => [
    // Group 1
    {
        items: [
            {
                label: t('settings.appearance'),
                hasArrow: true,
                action: 'openAppearance'
            },
            { label: t('settings.insights') },
            {
                label: t('settings.settingsMenu'),
                hasArrow: true,
                action: 'openLanguage'
            }
        ]
    },
    // Group 2
    {
        items: [
            {
                label: t('settings.feeds'),
                hasArrow: true,
                action: 'openFeeds'
            },
            { label: t('settings.saved') },
            { label: t('settings.liked') }
        ]
    },
    // Group 3
    {
        items: [
            { label: t('settings.reportProblem') },
            {
                label: t('settings.logout'),
                isDanger: true,
                action: 'logout'
            }
        ]
    }
]

// Guest user menu items
export const getGuestMenuItems = (t) => [
    {
        label: t('settings.appearance'),
        hasArrow: true,
        action: 'openAppearance'
    },
    { label: t('settings.reportProblem') }
]
