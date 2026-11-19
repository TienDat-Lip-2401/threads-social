import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function AuthFooter() {
    const { t } = useTranslation()
    const currentYear = new Date().getFullYear()

    return (
        <footer className='footer'>
            <ul className='footer__list'>
                <li>© {currentYear}</li>
                <li>
                    <Link to='#'>{t('footer.terms')}</Link>
                </li>
                <li>
                    <Link to='#'>{t('footer.privacy')}</Link>
                </li>
                <li>
                    <Link to='#'>{t('footer.cookies')}</Link>
                </li>
                <li>
                    <Link to='#'>{t('footer.cookieSettings')}</Link>
                </li>
                <li>
                    <Link to='#'>{t('footer.report')}</Link>
                </li>
            </ul>
        </footer>
    )
}
export default AuthFooter
