import { CheckCircle } from 'lucide-react';

function SuccessMessage({ successMessage }) {
    return (
        <div className='mb-2 w-full rounded-lg border border-gray-300 bg-gray-400/20 p-4 dark:border-gray-400 dark:bg-gray-800/50'>
            <div className='flex items-start gap-3'>
                <CheckCircle className='mt-0.5 h-5 w-5 shrink-0 text-black dark:text-gray-200' />
                <p className='text-sm font-medium whitespace-pre-line text-gray-800 md:text-[15px] dark:text-gray-200'>
                    {successMessage}
                </p>
            </div>
        </div>
    );
}
export default SuccessMessage;
