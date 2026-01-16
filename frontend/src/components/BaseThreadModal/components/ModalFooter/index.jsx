import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import settingsIcon from '@/assets/icons/settings-icon.svg';
import { LoaderCircle } from 'lucide-react';

function ModalFooter({ onPostSubmission, disabled, isSubmitting }) {
    const { t } = useTranslation();

    return (
        <div className='flex shrink-0 items-center justify-between p-6'>
            <button className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                <img
                    src={settingsIcon}
                    alt='icon'
                    className='icon-gray h-4 w-4 dark:text-gray-400'
                />
                <span className='text-sm'>
                    {t('threadModal.reply.options')}
                </span>
            </button>

            <Button
                onClick={onPostSubmission}
                disabled={disabled}
                variant='secondary'
                className='h8.5 rounded-3xl border border-transparent bg-black text-base font-medium text-white hover:bg-black disabled:bg-gray-700/90 disabled:text-white md:rounded-lg md:border-gray-400 md:bg-transparent md:text-[15px] md:text-black md:hover:bg-transparent md:disabled:border-gray-400/60 md:disabled:bg-transparent md:disabled:text-gray-500 dark:bg-white dark:text-black dark:disabled:bg-gray-400 dark:disabled:text-black md:dark:border-gray-400/50 md:dark:bg-[#181818] md:dark:text-white md:dark:disabled:md:border-gray-400/50 md:dark:disabled:bg-[#181818] md:dark:disabled:text-gray-400/50'
            >
                {isSubmitting && (
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                )}
                {isSubmitting
                    ? t('threadModal.actions.posting')
                    : t('threadModal.actions.post')}
            </Button>
        </div>
    );
}
export default ModalFooter;
