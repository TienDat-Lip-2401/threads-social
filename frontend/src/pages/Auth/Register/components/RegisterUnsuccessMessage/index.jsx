import { Trans } from 'react-i18next';
import { XCircle } from 'lucide-react';

function RegisterUnsuccessMessage({ errorMessage }) {
    return (
        <div className='-mt-2 mb-2 w-full rounded-lg border border-red-300 bg-red-50/80 p-4 dark:bg-red-950/30'>
            <div className='flex items-start gap-2'>
                <XCircle className='h-5 w-5 shrink-0 text-red-500 dark:text-red-200' />
                <p className='text-sm text-red-600 md:text-[15px] dark:text-red-200'>
                    <Trans
                        i18nKey='auth.messages.registerErrorMessage'
                        values={{ error: errorMessage }}
                        components={{
                            strong: <strong className='font-semibold' />,
                        }}
                    />
                </p>
            </div>
        </div>
    );
}
export default RegisterUnsuccessMessage;
