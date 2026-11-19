import { Navigate, Outlet } from 'react-router-dom';

import { useCurrentUser } from '@/features/auth';
import { ROUTES } from '@/constants';

function PublicRoute() {
    const currentUser = useCurrentUser();

    if (!currentUser) {
        return <Outlet />;
    }

    return <Navigate to={ROUTES.HOME} />;
}
export default PublicRoute;
