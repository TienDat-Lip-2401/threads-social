import { DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

import draftIcon from '@/assets/icons/drafts-icon.svg';
import moreIcon from '@/assets/icons/more-icon.svg';

function ModalHeader({ title, hasDraftIcon = false, setIsOpen }) {
    const { t } = useTranslation();

    return (
        <div className='flex shrink-0 items-center justify-between p-6'>
            <button
                className='text-base font-[350] outline-none dark:text-white'
                onClick={() => setIsOpen(false)}
            >
                {t('threadModal.actions.cancel')}
            </button>

            <DialogTitle className='flex-1 text-center text-base font-semibold dark:text-white'>
                {title}
            </DialogTitle>

            <div className='flex items-center gap-3'>
                {hasDraftIcon && (
                    <button className='h-5 w-5'>
                        <img
                            src={draftIcon}
                            alt='drafts icon'
                            className='dark:invert'
                        />
                    </button>
                )}
                <button className='h-5 w-5'>
                    <img
                        src={moreIcon}
                        alt='more icon'
                        className='dark:invert'
                    />
                </button>
            </div>
        </div>
    );
}

export default ModalHeader;
