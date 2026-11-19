import AppRouter from '@/router/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import { Provider as ReduxProvider } from 'react-redux';

import '@/utils/i18n';
import '@/styles/index.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { persistor, store } from '@/store/store';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
    return (
        <>
            <ReduxProvider store={store}>
                {/* ✅ PersistGate sẽ chờ rehydrate xong mới render app */}
                <PersistGate loading={null} persistor={persistor}>
                    <ThemeProvider
                        defaultTheme='system'
                        storageKey='vite-ui-theme'
                    >
                        <AppRouter />
                        <Toaster
                            position='bottom-center'
                            toastOptions={{
                                classNames: {
                                    toast: 'bg-black! text-white! font-semibold! px-6 py-3 whitespace-nowrap dark:bg-white! dark:text-black! border-black dark:border-white',
                                    error: 'bg-[#fee2e2]! border-[#fecaca]! text-[#b91c1c]! font-semibold px-6 py-3 whitespace-nowrap',
                                },
                                duration: 3000,
                            }}
                        />
                    </ThemeProvider>
                </PersistGate>
            </ReduxProvider>
        </>
    );
}

export default App;
