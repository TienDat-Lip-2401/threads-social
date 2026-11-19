import { useTranslation } from 'react-i18next';

function EmptyMessage({ message }) {
    const { t } = useTranslation();

    return (
        <div className='p-6'>
            <p className='text-center text-sm text-gray-500'>{t(message)}</p>
        </div>
    );
}
export default EmptyMessage;
