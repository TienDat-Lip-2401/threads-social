import { useTranslation } from 'react-i18next';

import MenuSections from '@/components/MenuSections';
import { gettingRepostMenuSection } from '@/constants/repostMenu';

function RepostMenuContent({ isReposted, onRepost, onQuote }) {
    const { t } = useTranslation();

    // ← Map action name to handler
    const actionHandlers = {
        repost: onRepost,
        quote: onQuote,
    };

    const menuSection = gettingRepostMenuSection(t, isReposted);

    return (
        <MenuSections
            groupedMenu={menuSection}
            actionHandlers={actionHandlers}
        />
    );
}

export default RepostMenuContent;
