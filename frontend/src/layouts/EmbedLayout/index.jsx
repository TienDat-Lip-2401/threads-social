import { Outlet } from 'react-router-dom';

function EmbedLayout() {
    return (
        <div className='w-ful min-h-screen bg-white pt-10'>
            <main className='w-full px-6'>
                <Outlet />
            </main>
        </div>
    );
}

export default EmbedLayout;
