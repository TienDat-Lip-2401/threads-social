import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '../ui/separator';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { createPost, createReply, getReplies } from '@/services/posts';
import ModalHeader from './components/ModalHeader';
import ModalFooter from './components/ModalFooter';
import ModalContent from './components/ModalContent';
import OriginalPost from './components/OriginalPost';
import QuotedPostCard from '@/components/QuotedPostCard';
import RepliesList from './components/RepliesList';
import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import { useCurrentUser } from '@/features/auth';

/**
 * Base modal cho cả New Thread và Reply
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} setIsOpen - Function để toggle modal
 * @param {string} type - type của modal ("New thread" hoặc "Reply")
 * @param {object} originalPost - Post gốc (chỉ dùng cho Reply modal)
 * @param {number} postId - ID của post gốc (cho reply)
 * @param {object} quotedPost - Bài được trích dẫn (chỉ dùng cho Quote)
 */
function BaseThreadModal({
    isOpen,
    setIsOpen,
    type = 'newThread',
    originalPost = null,
    postId = null,
    quotedPost = null,
}) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currentUser = useCurrentUser();
    const avatarSrc = currentUser?.avatar_url || defaultAvatar;

    // 📌 State management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [threads, setThreads] = useState([
        {
            id: Date.now(),
            content: '',
            images: [],
        },
    ]);

    // 📌 Xác định config dựa trên type
    const isReplyMode = type === 'reply';

    // Translate cho title
    const title = isReplyMode
        ? t('threadModal.reply.title')
        : t('threadModal.newThread.title');

    // Translation cho placeholder
    const placeholder = isReplyMode
        ? `${t('threadModal.reply.placeholder')} ${originalPost?.user?.username || 'user'}`
        : t('threadModal.newThread.placeholder');

    // Auto determine hasDraftIcon
    const hasDraftIcon = !isReplyMode;

    // Lấy replies từ Redux store
    const repliesData = useSelector((state) =>
        postId ? state.posts.replies[postId] : null,
    );

    const hasFetchedRef = useRef(false);

    // 📌 Load replies khi modal mở (chỉ cho Reply mode)
    useEffect(() => {
        if (isOpen) {
            // Chỉ fetch khi chưa có data & các đk còn lại đều đúng
            if (postId && type === 'reply' && !hasFetchedRef.current) {
                hasFetchedRef.current = true;
                dispatch(getReplies({ postId }))
                    .unwrap()
                    .catch(() => {
                        hasFetchedRef.current = false; // Reset on error
                    });
            }
        } else {
            // Reset khi đóng modal
            hasFetchedRef.current = false;
            setThreads([{ id: Date.now(), content: '', images: [] }]);
        }
    }, [isOpen, postId, dispatch, type]);

    // ========================================
    // 📌 HANDLERS
    // ========================================

    // TODO "Add to thread" - Thêm thread mới (NO API call)
    // TODO - Create new thread object -> Append to threads array
    const handleAddToThread = () => {
        setThreads((prev) => [
            ...prev,
            {
                id: Date.now(),
                content: '',
                images: [],
            },
        ]);
    };

    // TODO Update content
    // TODO - Map through threads → Update matching threadId -> Re-render với content mới
    const updateThreadContent = (threadId, newContent) => {
        setThreads((prev) =>
            prev.map((thread) =>
                thread.id === threadId
                    ? { ...thread, content: newContent }
                    : thread,
            ),
        );
    };

    // TODO Update images
    const updateThreadImages = (threadId, newImages) => {
        setThreads((prev) =>
            prev.map((thread) =>
                thread.id === threadId
                    ? { ...thread, images: newImages }
                    : thread,
            ),
        );
    };

    // TODO Handler khi user chọn images
    const handleThreadImageSelect = (threadId, currentImages, files) => {
        const remainingSlots = 10 - currentImages.length;

        if (files.length > remainingSlots) {
            toast.warning(`Only ${remainingSlots} more image(s) allowed`);
        }

        const filesToAdd = files.slice(0, remainingSlots);
        updateThreadImages(threadId, [...currentImages, ...filesToAdd]);
    };

    // TODO Handler khi user xóa image
    const handleThreadImageRemove = (
        threadId,
        currentImages,
        indexToRemove,
    ) => {
        const filteredImages = currentImages.filter(
            (_, index) => index !== indexToRemove,
        );
        updateThreadImages(threadId, filteredImages);
    };

    // TODO "Post" button - Submit tất cả
    const handlePostSubmission = async () => {
        const validThreads = threads.filter((thread) => thread.content.trim());

        if (validThreads.length === 0) {
            toast.error('Please add some content');
            return;
        }

        setIsSubmitting(true);

        try {
            if (isReplyMode && postId) {
                //! Reply mode: Submit tất cả Thread replies
                for (const thread of validThreads) {
                    await dispatch(
                        createReply({
                            parentPostId: postId,
                            replyData: {
                                content: thread.content.trim(),
                                media: thread.images,
                                reply_permission: 'everyone',
                            },
                        }),
                    ).unwrap();
                }

                // Refetch replies để lấy data mới nhất
                await dispatch(getReplies({ postId })).unwrap();
                toast.success('Posted');
            } else {
                //! New Thread mode: Chỉ submit thread đầu tiên
                await dispatch(
                    createPost({
                        content: validThreads[0].content.trim(),
                        media: validThreads[0].images,
                        quotedPostId: quotedPost?.id,
                    }),
                ).unwrap();
                toast.success('Post created!');
            }

            // Reset & close
            setThreads([{ id: Date.now(), content: '', images: [] }]);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to refresh replies:', error);
            toast.error('Failed to post');
        } finally {
            // Check if still mounted
            if (isOpen) {
                setIsSubmitting(false);
            }
        }
    };

    const hasContent = threads.some((t) => t.content.trim());

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className='flex h-full w-full max-w-none flex-col gap-0 rounded-none p-0 outline-none sm:h-[90vh] sm:max-h-[800px] sm:rounded-xl sm:border md:max-w-[600px] dark:border dark:border-gray-400/30 dark:bg-[#181818]'
                aria-describedby={undefined}
            >
                {/* Header */}
                <ModalHeader
                    title={title}
                    hasDraftIcon={hasDraftIcon} // ← Conditional icon
                    setIsOpen={setIsOpen}
                />

                {<Separator className='hidden sm:block dark:bg-gray-400/30' />}

                <div className='flex-1 overflow-y-auto'>
                    {/* 📌 ORIGINAL POST - (Reply mode only) */}
                    {originalPost && <OriginalPost post={originalPost} />}

                    {/* REPLIES LIST - Hiển thị replies đã có (Reply mode only) */}
                    {repliesData && (
                        <RepliesList
                            replies={repliesData.data}
                            isLoading={repliesData.isLoading}
                        />
                    )}

                    {/*  📌 THREADS MAIN CONTENT - Render multiple ModalContent - Luôn hiển thị */}
                    {threads.map((thread, index) => {
                        let placeholderText = placeholder;
                        if (isReplyMode && threads.length > 1) {
                            placeholderText = `${placeholder} (${index + 1}/${threads.length})`;
                        }

                        return (
                            <React.Fragment key={thread.id}>
                                <ModalContent
                                    placeholder={placeholderText}
                                    content={thread.content}
                                    onContentChange={(value) =>
                                        updateThreadContent(thread.id, value)
                                    }
                                    images={thread.images}
                                    onImageSelect={(files) =>
                                        handleThreadImageSelect(
                                            thread.id,
                                            thread.images,
                                            files,
                                        )
                                    }
                                    onImageRemove={(index) =>
                                        handleThreadImageRemove(
                                            thread.id,
                                            thread.images,
                                            index,
                                        )
                                    }
                                />

                                {/* Separator giữa các threads */}
                                {index < threads.length - 1 && (
                                    <div className='mx-6 border-t border-gray-200 dark:border-gray-700' />
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Quote: xem trước bài được trích dẫn */}
                    {quotedPost && (
                        <div className='px-6 pb-3 pl-[72px]'>
                            <QuotedPostCard post={quotedPost} showStats={false} />
                        </div>
                    )}

                    {/* "Add to thread" button */}
                    {isReplyMode && (
                        <div className='flex items-center gap-5 px-9 py-3'>
                            <img
                                src={avatarSrc}
                                alt='avatar small'
                                className='h-4 w-4 rounded-full object-cover opacity-50'
                            />
                            <button
                                onClick={handleAddToThread}
                                // Check last thread
                                disabled={
                                    !threads[threads.length - 1].content.trim()
                                }
                                className='text-sm font-light text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400'
                            >
                                {t('threadModal.content.addToThread')}
                                {threads.length > 1 && `(${threads.length}/4)`}
                            </button>
                        </div>
                    )}
                </div>

                {/* 📌 FOOTER - Với Post button handler  */}
                <ModalFooter
                    onPostSubmission={handlePostSubmission}
                    disabled={!hasContent || isSubmitting}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
}

export default BaseThreadModal;
