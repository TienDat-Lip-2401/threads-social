import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { BiChevronRight } from 'react-icons/bi';

import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import { useCurrentUser } from '@/features/auth';
import ModalToolbar from '../ModalToolbar';
import { useTranslation } from 'react-i18next';
import ImagePreview from '../ImagePreview';

function ModalContent({
    placeholder = "What's new?",
    content,
    onContentChange,
    // Props cho images handling
    images,
    onImageSelect,
    onImageRemove,
}) {
    const { t } = useTranslation();
    const currentUser = useCurrentUser();
    const avatarSrc = currentUser?.avatar_url || defaultAvatar;

    // State để track topic
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isTopicOpen, setIsTopicOpen] = useState(false);

    const handleContentChange = (e) => onContentChange(e.target.value);
    const handleTopicClick = () => setIsTopicOpen(true);

    return (
        <div className='flex-1 px-6 pt-3'>
            <div className='flex gap-3'>
                {/* Avatar + Vertical Line */}
                <div className='flex flex-col items-center'>
                    <img
                        src={avatarSrc}
                        alt='avatar'
                        className='h-9 w-9 rounded-full object-cover'
                    />
                    <div className='mt-2 w-0.5 flex-1 bg-gray-400/50 dark:bg-gray-400/30'></div>
                </div>

                {/* Content Area */}
                <div className='flex-1'>
                    {/* Top Row */}
                    <div className='mb-1 flex items-center'>
                        <div className='flex items-center'>
                            <span className='text-base font-medium md:text-sm dark:text-white'>
                                {currentUser?.username}
                            </span>

                            {selectedTopic ? (
                                // Hiển thị topic đã chọn
                                <div className='flex items-center'>
                                    <BiChevronRight
                                        className='text-gray-400 dark:text-gray-500'
                                        size={18}
                                    />
                                    <button
                                        onClick={handleTopicClick}
                                        className='text-base font-medium text-black outline-none hover:underline md:text-sm dark:text-gray-400'
                                    >
                                        {selectedTopic.name}
                                    </button>
                                </div>
                            ) : (
                                // Hiển thị ô input "Add a topic"
                                <div className='flex items-center'>
                                    <BiChevronRight
                                        className='text-gray-400 dark:text-gray-500'
                                        size={18}
                                    />
                                    <input
                                        type='text'
                                        placeholder={t(
                                            'threadModal.content.addTopic',
                                        )}
                                        className='border-none text-base font-medium text-black outline-none placeholder:font-light placeholder:text-gray-500 md:text-sm dark:text-gray-500'
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Textarea */}
                    <TextareaAutosize
                        rows={3}
                        className='mb-2 w-full resize-none border-none bg-transparent text-base font-[350] outline-none placeholder:text-gray-400 md:text-sm dark:text-white dark:placeholder:text-gray-500'
                        placeholder={placeholder}
                        value={content}
                        onChange={handleContentChange}
                    />

                    {/* Image Preview */}
                    <ImagePreview images={images} onRemove={onImageRemove} />

                    {/* Icon Toolbar */}
                    <ModalToolbar onImagesSelect={onImageSelect} />
                </div>
            </div>

            {/* Add to thread */}
            {/* <div className='flex items-center gap-5 px-2.5 py-2'>
                <img
                    src={defaultAvatar}
                    alt='avatar small'
                    className='h-4 w-4 rounded-full object-cover opacity-50'
                />

                {isReplyMode && (
                    <button
                        onClick={onAddToThread}
                        className={cn(
                            'text-base font-light text-gray-400/80 md:text-sm dark:text-gray-500',
                            content && 'text-gray-500',
                        )}
                    >
                        {t('threadModal.content.addToThread')}
                    </button>
                )}
            </div> */}

            {/* // TODO: Topic Selector Modal/Dropdown */}
            {/* {isTopicModalOpen && (
                <TopicSelectorModal
                    isOpen={isTopicModalOpen}
                    onClose={() => setIsTopicModalOpen(false)}
                    onSelectTopic={(topic) => {
                        setSelectedTopic(topic);
                        setIsTopicModalOpen(false);
                    }}
                />
            )} */}
        </div>
    );
}

export default ModalContent;
