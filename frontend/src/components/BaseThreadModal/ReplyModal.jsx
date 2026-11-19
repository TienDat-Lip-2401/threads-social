import BaseThreadModal from './index';

// Config BaseThreadModal cho chức năng Reply, nhận thêm post object.
function ReplyModal({ isOpen, setIsOpen, post }) {
    return (
        <BaseThreadModal
            // 📌 Props từ parent component
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            // 📌 Config cố định cho Reply
            type='reply'
            // 📌 Props động dựa trên post
            originalPost={post}
            postId={post.id}
        />
    );
}

export default ReplyModal;
