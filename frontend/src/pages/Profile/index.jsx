import { Outlet } from 'react-router-dom';

import ProfileHeader from './components/ProfileHeader';
import NavigationTabs from './components/NavigationTabs';

function Profile() {
    return (
        <div className='home-wrapper'>
            <div className='posts-container divide-none py-4'>
                {/* Profile Header */}
                <ProfileHeader />

                {/* Profile Navigation Tabs */}
                <NavigationTabs />

                <Outlet />
            </div>
        </div>
    );
}
export default Profile;
