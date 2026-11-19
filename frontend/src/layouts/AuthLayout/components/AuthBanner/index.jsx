import threadsBanner from '@/assets/images/threads-banner.png'

function AuthBanner() {
    return (
        <div className='auth-banner'>
            <img src={threadsBanner} alt='banner' className='auth-img' />
        </div>
    )
}
export default AuthBanner
