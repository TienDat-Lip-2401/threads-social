import { useRef } from 'react';

import photoIcon from '@/assets/icons/photo-icon.svg';
import gifIcon from '@/assets/icons/gif-icon.svg';
import emojiIcon from '@/assets/icons/emoji-icon.svg';
import pollIcon from '@/assets/icons/poll-icon.svg';
import attachedIcon from '@/assets/icons/attached-icon.svg';
import locationIcon from '@/assets/icons/location-icon.svg';

function ModalToolbar({ onImagesSelect }) {
    // Ref để access hidden input
    const fileInputRef = useRef(null);

    // Handler khi click photo icon
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    // Handler khi user chọn files
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onImagesSelect(files);
        }

        // Reset input để có thể chọn lại cùng file
        e.target.value = '';
    };

    return (
        <div className='mb-3 flex items-center gap-4 text-gray-500'>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type='file'
                accept='image/*, video/*'
                multiple
                onChange={handleFileChange}
                className='hidden'
            />

            {/* Photo icon - trigger file input */}
            <button type='button' onClick={handlePhotoClick}>
                <img
                    src={photoIcon}
                    className='icon-gray h-4 w-4 dark:opacity-60 dark:invert'
                />
            </button>
            <button>
                <img
                    src={gifIcon}
                    className='icon-gray h-4 w-4 dark:opacity-60 dark:invert'
                />
            </button>
            <button>
                <img
                    src={emojiIcon}
                    className='icon-gray h-4 w-4 dark:opacity-60 dark:invert'
                />
            </button>
            <button>
                <img
                    src={pollIcon}
                    className='icon-gray h-4 w-4 dark:opacity-60 dark:invert'
                />
            </button>
            <button>
                <img
                    src={attachedIcon}
                    className='icon-gray h-4 w-4 dark:opacity-60 dark:invert'
                />
            </button>
            <button>
                <img
                    src={locationIcon}
                    className='icon-gray h-4 w-4 dark:opacity-60 dark:invert'
                />
            </button>
        </div>
    );
}
export default ModalToolbar;
