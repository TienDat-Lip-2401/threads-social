import { useDragScroll } from '@/hooks/useDragScroll';

function ImageCarousel({
    images = [],
    postId,
    className = 'flex gap-1 px-16',
}) {
    const { scrollRef, handlers } = useDragScroll();

    if (images.length === 0) return null;

    return (
        <div
            ref={scrollRef} // Attach ref
            {...handlers} // spread all handlers for event listeners
            className='scrollbar-hide mt-2 w-full cursor-grab overflow-x-auto active:cursor-grabbing'
        >
            <div className={className}>
                {images.map((img, index) => (
                    <img
                        key={`${postId}-img-${index}`}
                        src={img}
                        alt={`Post image ${index + 1}`}
                        className='pointer-events-none h-[280px] w-auto shrink-0 rounded-md object-cover select-none'
                        draggable='false'
                    />
                ))}

                {/* Spacer để tạo padding cuối */}
                <div className='w-4 shrink-0' />
            </div>
        </div>
    );
}

export default ImageCarousel;
