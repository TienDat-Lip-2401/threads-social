import { useTranslation } from 'react-i18next';

import MenuSections from '@/components/MenuSections';
import { gettingSharedMenuSection } from '@/constants/sharedMenu';

function SharedMenuContent({ onCopyLink, onCopyAsImage, onGetEmbedCode }) {
    const { t } = useTranslation();

    // ← Map action name to handler
    const actionHandlers = {
        copyLink: onCopyLink,
        copyImage: onCopyAsImage,
        getEmbedCode: onGetEmbedCode,
    };

    const menuSection = gettingSharedMenuSection(t);

    return (
        <MenuSections
            groupedMenu={menuSection}
            actionHandlers={actionHandlers}
        />
    );
}

export default SharedMenuContent;
