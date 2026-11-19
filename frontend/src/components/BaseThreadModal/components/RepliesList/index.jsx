import LoadingSpinner from '@/components/LoadingSpinner';
import ReplyItem from '../ReplyItem';

function RepliesList({ replies, isLoading }) {
    if (!replies || replies.length === 0) {
        return null;
    }

    if (isLoading) {
        return <LoadingSpinner text='Loading replies...' />;
    }

    return (
        <div className='space-y-3 pt-3'>
            {replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
            ))}
        </div>
    );
}

export default RepliesList;
