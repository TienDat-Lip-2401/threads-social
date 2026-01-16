import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import NewThreadModal from '../BaseThreadModal/NewThreadModal';
import { useCurrentUser } from '@/features/auth';

function PostComposer() {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const avatarSrc = currentUser?.avatar_url || defaultAvatar;

    const [isOpenModal, setIsOpenModal] = useState(false);

    return (
        <div className='hidden items-center justify-between gap-3 px-4 py-3 md:flex'>
            <img
                src={avatarSrc}
                alt='avatar'
                className='h-9 w-9 rounded-full object-cover'
            />
            <p
                className='mr-auto text-sm font-light text-gray-400'
                onClick={() => setIsOpenModal(!isOpenModal)}
            >
                {t('post.whatsNew')}
            </p>

            <Button
                variant='secondary'
                className='h-8 rounded-lg border bg-transparent px-3.5 text-xs hover:bg-white dark:border-gray-500/50 dark:bg-black/40'
                onClick={() => setIsOpenModal(!isOpenModal)}
            >
                {t('post.postButton')}
            </Button>

            <NewThreadModal
                isOpenModal={isOpenModal}
                setIsOpenModal={setIsOpenModal}
            />
        </div>
    );
}
export default PostComposer;
