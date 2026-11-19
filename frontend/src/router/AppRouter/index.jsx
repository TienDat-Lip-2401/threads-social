import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PrivateRoute from '../PrivateRoute';
import PublicRoute from '../PublicRoute';
import { ROUTES } from '@/constants';
import AuthLayout from '@/layouts/AuthLayout';
import DefaultLayout from '@/layouts/DefaultLayout';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import Register from '@/pages/Auth/Register';
import Login from '@/pages/Auth/Login';
import ForgotPassword from '@/pages/Auth/ForgotPassword';
import ResetPassword from '@/pages/Auth/ResetPassword';
import VerifyEmail from '@/pages/Auth/VerifyEmail';
import AuthProvider from '@/components/AuthProvider';
import EmbedLayout from '@/layouts/EmbedLayout';
import Embed from '@/pages/Embed';
import Profile from '@/pages/Profile';
import Threads from '@/pages/Profile/components/Threads';
import Replies from '@/pages/Profile/components/Replies';
import Media from '@/pages/Profile/components/Media';
import Reposts from '@/pages/Profile/components/Reposts';

function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider />

            <Routes>
                {/* Protected Routes - Các route cần đăng nhập */}
                <Route element={<PrivateRoute />}></Route>

                {/* PUBLIC ROUTES - Home độc lập */}
                <Route element={<DefaultLayout />}>
                    <Route path={ROUTES.HOME} element={<Home />} />

                    {/* /profile = hồ sơ của mình, /profile/:username = hồ sơ người khác */}
                    {[ROUTES.PROFILE, ROUTES.PROFILE_USER].map((path) => (
                        <Route key={path} path={path} element={<Profile />}>
                            <Route index element={<Threads />} />
                            <Route path={ROUTES.REPLIES} element={<Replies />} />
                            <Route path={ROUTES.MEDIA} element={<Media />} />
                            <Route path={ROUTES.REPOSTS} element={<Reposts />} />
                        </Route>
                    ))}
                </Route>

                <Route element={<EmbedLayout />}>
                    <Route path={ROUTES.EMBED_CODE} element={<Embed />} />
                </Route>

                {/* Public Routes - Cho auth pages */}
                {/* Auth Layout */}
                <Route element={<PublicRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route path={ROUTES.REGISTER} element={<Register />} />
                        <Route path={ROUTES.LOGIN} element={<Login />} />
                        <Route
                            path={ROUTES.FORGOT_PASSWORD}
                            element={<ForgotPassword />}
                        />
                        <Route
                            path={ROUTES.RESET_PASSWORD}
                            element={<ResetPassword />}
                        />
                        <Route
                            path={ROUTES.VERIFY_EMAIL}
                            element={<VerifyEmail />}
                        />
                    </Route>

                    {/* NotFound page */}
                    <Route path='*' element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
