import BaseThreadModal from './index';

// Config cho BaseThreadModal, không chứa UI logic.
// quotedPost: có → hộp đăng bài Quote (kèm thẻ nhúng bài gốc)
function NewThreadModal({ isOpenModal, setIsOpenModal, quotedPost = null }) {
    return (
        <BaseThreadModal
            // 📌 Props từ parent component
            isOpen={isOpenModal}
            setIsOpen={setIsOpenModal}
            // 📌 Config cố định cho New Thread
            type='New thread'
            quotedPost={quotedPost}
        />
    );
}

export default NewThreadModal;
