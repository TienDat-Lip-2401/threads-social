import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LoadingSpinner from '@/components/LoadingSpinner';
import { getPostById } from '@/services/posts';
import EmbedPostCard from '@/components/EmbedPostCard';

/**
 * Embed Page - Hiển thị single post để nhúng vào iframe
 * Route: /:username/post/:postId/embed
 */

function Embed() {
    const dispatch = useDispatch();
    const { postId } = useParams();

    const postIdNumber = +postId;

    // Lấy post từ Redux store
    const post = useSelector((state) =>
        state.posts.posts.find((p) => p.id === postIdNumber),
    );

    // Fetch post data nếu chưa có
    useEffect(() => {
        if (postIdNumber && !post) {
            dispatch(getPostById(postIdNumber));
        }
    }, [postIdNumber, post, dispatch]);

    // Loading state
    if (!post) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <LoadingSpinner text='Loading post...' />
            </div>
        );
    }

    return <EmbedPostCard post={post} />;
}

export default Embed;
