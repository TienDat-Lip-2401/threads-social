function LoadingSpinner() {
    return (
        <div className='home-wrapper'>
            <div className='posts-container'>
                <div className='flex h-full flex-1 items-center justify-center'>
                    {/* Loading spinner animation */}
                    <div className='flex w-full flex-col items-center gap-3'>
                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700 dark:border-gray-700 dark:border-t-gray-300'></div>
                        <p className='text-sm text-gray-500'>
                            Loading posts...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingSpinner;
