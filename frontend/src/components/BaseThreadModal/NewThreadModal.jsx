import BaseThreadModal from './index';

// Config cho BaseThreadModal, không chứa UI logic.
function NewThreadModal({ isOpenModal, setIsOpenModal }) {
    return (
        <BaseThreadModal
            // 📌 Props từ parent component
            isOpen={isOpenModal}
            setIsOpen={setIsOpenModal}
            // 📌 Config cố định cho New Thread
            type='New thread'
        />
    );
}

export default NewThreadModal;
