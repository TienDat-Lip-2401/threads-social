import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard';

import { toggleRepostOptimistic, useInteraction } from '@/features/posts';
import { toggleLikePost } from '@/services/posts';
import loveIcon from '@/assets/icons/love-icon.svg';
import loveIconFilled from '@/assets/icons/love-icon-filled.svg';
import commentIcon from '@/assets/icons/comment-icon.svg';
import repostIcon from '@/assets/icons/repost-icon.svg';
import shareIcon from '@/assets/icons/share-icon.svg';
import PostActionButton from '../PostActionButton';
import ReplyModal from '@/components/BaseThreadModal/ReplyModal';
import SharedMenuDropDown from '../SharedMenuDropDown';
import RepostMenuDropDown from '../RepostMenuDropDown';
import CopyAsImageModal from '../CopyAsImageModal';
import EmbedModal from '@/components/EmbedModal';
import { useIsAuthenticated } from '@/features/auth';
import LoginAlertDialog from '@/components/LoginAlertDialog';

function InteractionBar({ postId, showMetrics }) {
    const dispatch = useDispatch();

    const isAuthenticated = useIsAuthenticated();

    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    // 📌 Lấy interaction data cho post này
    const interaction = useInteraction(postId);

    // Lấy full post data từ Redux store
    const post = useSelector(
        (state) =>
            state.posts.posts.find((post) => post.id === postId) ||
            state.posts.profile.posts.find((post) => post.id === postId),
        shallowEqual,
    );

    // 💡 Handler cho Like
    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setShowLoginDialog(true);
            return;
        }

        dispatch(toggleLikePost(postId));
    };

    // 💡  Handler cho Comment
    const handleComment = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setShowLoginDialog(true);
            return;
        }

        setIsReplyModalOpen(true);
    };

    // 💡 Handler cho Repost icon click - Check auth ngay khi click icon
    const handleRepostClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setShowLoginDialog(true);
            return;
        }

        // Nếu đã login, không làm gì (để dropdown tự mở)
    };

    // 💡 Handler cho Share icon click - Check auth ngay khi click icon
    const handleShareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setShowLoginDialog(true);
            return;
        }

        // Nếu đã login, không làm gì (để dropdown tự mở)
    };

    // 📌 Share handlers (chỉ chạy nếu đã authenticated)
    const handleCopyLink = () => {
        copy(`🔗 Post ${postId} copied`);
        toast('Copied');
    };

    const handleCopyAsImage = () => {
        setShowImageModal(true);
    };

    const handleGetEmbedCode = () => {
        setShowEmbedModal(true);
    };

    // 📌 Repost handlers (chỉ chạy nếu đã authenticated)
    const handleRepost = () => {
        dispatch(toggleRepostOptimistic(postId));
    };

    const handleQuote = () => {
        console.log('Quote');
    };

    // Dynamic config - data thay đổi theo interaction state
    const actionBtns = [
        {
            src: interaction.isLiked ? loveIconFilled : loveIcon,
            alt: 'love icon',
            statNumber: showMetrics && interaction.likeCount,
            onClick: handleLike,
            isActive: interaction.isLiked,
            activeColor: 'text-[#ff0034]',
        },
        {
            src: commentIcon,
            alt: 'comment icon',
            statNumber: showMetrics && (post?.replies_count || 0),
            onClick: handleComment,
            isActive: false,
        },
    ];

    return (
        <div className='mt-3 flex gap-2'>
            {/* Action buttons */}
            {actionBtns.map((btn) => (
                <PostActionButton
                    key={`${postId}-${btn.alt}`}
                    src={btn.src}
                    alt={btn.alt}
                    onClick={btn.onClick}
                    isActive={btn.isActive}
                    activeColor={btn.activeColor}
                >
                    {btn.statNumber}
                </PostActionButton>
            ))}

            {/* 💡 Repost Button - Conditionally render based on auth */}
            {isAuthenticated ? (
                // Đã login → Show dropdown bình thường
                <RepostMenuDropDown
                    trigger={
                        <PostActionButton
                            key={`${postId}-repost`}
                            src={repostIcon}
                            alt='repost icon'
                            isActive={interaction.isReposted}
                            activeColor='text-[#1d9bf0]'
                        >
                            {showMetrics && (interaction.repostCount || 0)}
                        </PostActionButton>
                    }
                    onRepost={handleRepost}
                    onQuote={handleQuote}
                />
            ) : (
                // Chưa login → Just button with onClick → Show dialog
                <PostActionButton
                    key={`${postId}-repost`}
                    src={repostIcon}
                    alt='repost icon'
                    onClick={handleRepostClick}
                    isActive={interaction.isReposted}
                    activeColor='text-[#1d9bf0]'
                >
                    {showMetrics && (interaction.repostCount || 0)}
                </PostActionButton>
            )}

            {/* 💡 Share Button - Conditionally render based on auth */}
            {isAuthenticated ? (
                // Đã login → Show dropdown bình thường
                <SharedMenuDropDown
                    key={`${postId}-share`}
                    trigger={
                        <PostActionButton src={shareIcon} alt='share icon'>
                            {showMetrics && 0}
                        </PostActionButton>
                    }
                    onCopyLink={handleCopyLink}
                    onCopyAsImage={handleCopyAsImage}
                    onGetEmbedCode={handleGetEmbedCode}
                />
            ) : (
                // Chưa login → Just button with onClick → Show dialog
                <PostActionButton
                    key={`${postId}-share`}
                    src={shareIcon}
                    alt='share icon'
                    onClick={handleShareClick}
                >
                    {showMetrics && 0}
                </PostActionButton>
            )}

            {/* Reply Modal */}
            {post && isAuthenticated && (
                <ReplyModal
                    key={`${postId}-reply-modal`}
                    isOpen={isReplyModalOpen}
                    setIsOpen={setIsReplyModalOpen}
                    post={post}
                    postId={post.id}
                />
            )}

            {/* Image Modal */}
            {post && (
                <CopyAsImageModal
                    isOpen={showImageModal}
                    setIsOpen={setShowImageModal}
                    post={post}
                />
            )}

            {/* Embed Modal */}
            {post && (
                <EmbedModal
                    isOpen={showEmbedModal}
                    setIsOpen={setShowEmbedModal}
                    post={post}
                />
            )}

            {/* Login Alert Dialog */}
            <LoginAlertDialog
                isOpen={showLoginDialog}
                onClose={() => setShowLoginDialog(false)}
            />
        </div>
    );
}
export default InteractionBar;
