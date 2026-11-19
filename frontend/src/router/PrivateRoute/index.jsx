import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants';
import { useCurrentUser } from '@/features/auth';

function PrivateRoute() {
    const { pathname } = useLocation();
    const currentUser = useCurrentUser();

    if (currentUser) {
        return <Outlet />;
    }

    return (
        <Navigate
            to={`${ROUTES.LOGIN}?continue=${encodeURIComponent(pathname)}`}
        />
    );
}

export default PrivateRoute;
