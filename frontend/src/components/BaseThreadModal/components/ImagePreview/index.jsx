import { X } from 'lucide-react';

function ImagePreview({ images, onRemove }) {
    if (!images || images.length === 0) return null;

    return (
        <div className='mb-3 flex flex-wrap gap-2'>
            {images.map((file, index) => {
                {
                    /* Create preview ỦL cho mỗi file */
                }
                const previewUrl = URL.createObjectURL(file);

                return (
                    <div
                        key={index}
                        className='relative h-24 w-24 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600'
                    >
                        {/*  Image preview */}
                        <img
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            className='h-full w-full object-cover'
                            onLoad={() => {
                                // Clean up URL khi image loaded
                                URL.revokeObjectURL(previewUrl);
                            }}
                        />

                        {/* Remove button */}
                        <button
                            type='button'
                            onClick={() => onRemove(index)}
                            className='absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80'
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default ImagePreview;
