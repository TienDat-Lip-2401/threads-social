import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import InstagramOAuthButton from '../InstagramOAuthButton';

function LoginAlertDialog({ isOpen, onClose }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-sm rounded-xl border-0 bg-white px-12 pt-8 pb-14'>
                <DialogHeader>
                    <DialogTitle className='text-center text-3xl font-bold text-black'>
                        Say more with Threads
                    </DialogTitle>
                    <DialogDescription className='px-12 pb-4 text-center text-sm leading-relaxed font-light text-gray-500'>
                        Join Threads to share thoughts, find out what's going
                        on, follow your people and more.
                    </DialogDescription>
                </DialogHeader>

                <InstagramOAuthButton />
            </DialogContent>
        </Dialog>
    );
}

export default LoginAlertDialog;
