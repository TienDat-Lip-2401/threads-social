import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants'
import threadsLogo from '@/assets/images/threads-logo.svg'

function ThreadsLogo() {
    return (
        <Link
            to={ROUTES.HOME}
            className='fixed left-1/2 -z-10 -translate-x-1/2 min-[360px]:top-[5vh] min-[390px]:top-[8vh] md:hidden dark:invert'
        >
            <img src={threadsLogo} alt='logo' className='w-[60px]' />
        </Link>
    )
}
export default ThreadsLogo
