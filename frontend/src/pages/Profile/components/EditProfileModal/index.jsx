import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import defaultAvatar from '@/assets/images/default-avatar.jpeg';
import { getCurrentUser } from '@/services/auth';
import { updateProfile } from '@/services/users';

// Giới hạn khớp với BE (UserService.MaxNameLength / MaxBioLength)
const MAX_NAME = 50;
const MAX_BIO = 160;

function EditProfileModal({ open, onOpenChange, profile, onSaved }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Mỗi lần mở: lấy giá trị hiện tại của hồ sơ
    useEffect(() => {
        if (!open) return;
        setName(profile.name || '');
        setBio(profile.bio || '');
        setAvatarFile(null);
        setAvatarPreview(null);
        setErrors({});
    }, [open, profile]);

    // Giải phóng URL xem trước ảnh cũ
    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // cho phép chọn lại cùng file
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});
        try {
            const user = await updateProfile({ name, bio, avatar: avatarFile });
            dispatch(getCurrentUser()); // avatar/tên mới ở các chỗ dùng currentUser
            onSaved(user);
            toast.success(t('profilePage.editModal.success'), {
                duration: 3000,
            });
            onOpenChange(false);
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            toast.error(
                error.response?.data?.message ||
                    t('profilePage.editModal.error'),
                { position: 'top-right' },
            );
        } finally {
            setIsSaving(false);
        }
    };

    const fieldError = (key) =>
        errors[key]?.[0] && (
            <p className='mt-1 text-xs text-red-500'>{errors[key][0]}</p>
        );

    return (
        <Dialog open={open} onOpenChange={isSaving ? undefined : onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>
                        {t('profilePage.editModal.title')}
                    </DialogTitle>
                    <DialogDescription className='sr-only'>
                        {t('profilePage.editModal.title')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Avatar */}
                    <div className='flex items-center gap-4'>
                        <img
                            src={
                                avatarPreview ||
                                profile.avatar_url ||
                                defaultAvatar
                            }
                            alt='avatar preview'
                            className='h-16 w-16 rounded-full object-cover'
                        />
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handleAvatarChange}
                            className='hidden'
                        />
                        <button
                            type='button'
                            onClick={() => fileInputRef.current?.click()}
                            className='rounded-md border border-gray-400/50 px-3 py-1 text-sm font-medium'
                        >
                            {t('profilePage.editModal.changeAvatar')}
                        </button>
                    </div>
                    {fieldError('avatar')}

                    {/* Name */}
                    <div>
                        <div className='mb-1 flex justify-between text-sm font-medium'>
                            <label htmlFor='profile-name'>
                                {t('profilePage.editModal.name')}
                            </label>
                            <span className='text-xs font-light text-gray-400'>
                                {name.length}/{MAX_NAME}
                            </span>
                        </div>
                        <Input
                            id='profile-name'
                            value={name}
                            maxLength={MAX_NAME}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t(
                                'profilePage.editModal.namePlaceholder',
                            )}
                        />
                        {fieldError('name')}
                    </div>

                    {/* Bio */}
                    <div>
                        <div className='mb-1 flex justify-between text-sm font-medium'>
                            <label htmlFor='profile-bio'>
                                {t('profilePage.editModal.bio')}
                            </label>
                            <span className='text-xs font-light text-gray-400'>
                                {bio.length}/{MAX_BIO}
                            </span>
                        </div>
                        <textarea
                            id='profile-bio'
                            value={bio}
                            maxLength={MAX_BIO}
                            rows={3}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder={t(
                                'profilePage.editModal.bioPlaceholder',
                            )}
                            className='w-full resize-none rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700'
                        />
                        {fieldError('bio')}
                    </div>

                    <DialogFooter>
                        <button
                            type='button'
                            disabled={isSaving}
                            onClick={() => onOpenChange(false)}
                            className='rounded-md border border-gray-400/50 px-4 py-1.5 text-sm font-medium'
                        >
                            {t('profilePage.editModal.cancel')}
                        </button>
                        <button
                            type='submit'
                            disabled={isSaving}
                            className='flex items-center gap-2 rounded-md bg-black px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-black'
                        >
                            {isSaving && (
                                <LoaderCircle className='h-4 w-4 animate-spin' />
                            )}
                            {isSaving
                                ? t('profilePage.editModal.saving')
                                : t('profilePage.editModal.save')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditProfileModal;
