import { useTranslation } from 'react-i18next'

import MenuSections from '@/components/MenuSections'
import { gettingPostMenuSections } from '@/constants'

function PostMenuContent({ onFeedClick }) {
    const { t } = useTranslation()

    const actionHandlers = {
        openFeed: onFeedClick // ← Map action name to handler
    }

    const sections = gettingPostMenuSections(t)
    return <MenuSections groupedMenu={sections} actionHandlers={actionHandlers} />
}

export default PostMenuContent
