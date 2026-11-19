import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import copy from 'copy-to-clipboard';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import EmbedPostCard from '../EmbedPostCard';

function EmbedModal({ isOpen, setIsOpen, post }) {
    const embedUrl = `${window.location.origin}/${post?.user?.username}/post/${post?.id}/embed`;
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" scrolling="no"></iframe>`;

    const handleCopy = () => {
        copy(embedCode);
        toast('Embed code copied!');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='max-h-[90vh] max-w-[400px] overflow-y-auto rounded-xl border-none bg-white p-6 md:max-w-[600px]'>
                <VisuallyHidden asChild>
                    <DialogTitle>Embed Code</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden asChild>
                    <DialogDescription>Embed code</DialogDescription>
                </VisuallyHidden>

                {/* EmbedPostCard display on DESKTOP & hidden on MOBILE */}
                <div className='-mr-4 hidden md:block'>
                    <EmbedPostCard post={post} />
                </div>

                {/* Bottom Controls */}
                <div className='-mx-6 -mb-6 flex items-center rounded-b-2xl bg-white px-6 pb-4'>
                    <div className='relative flex w-full items-center'>
                        <input
                            type='text'
                            value={embedCode}
                            readOnly
                            className='w-full truncate rounded-lg bg-[#f5f5f5] py-4 pr-28 pl-4 font-mono text-sm text-gray-700 focus:outline-none'
                        />

                        <Button
                            onClick={handleCopy}
                            className='absolute right-3 h-8 shrink-0 rounded-md bg-black px-6 text-sm text-white hover:bg-black'
                        >
                            Copy
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default EmbedModal;
