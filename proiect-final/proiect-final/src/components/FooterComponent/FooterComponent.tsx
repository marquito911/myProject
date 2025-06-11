import React, { type JSX } from 'react'
import styles from './FotoerComponent.module.scss'
import { MailOutline, Description, ReportProblem, PrivacyTip, Info } from '@mui/icons-material'

const FooterComponent: React.FC = (): JSX.Element => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>
            <MailOutline className={styles.icon} />
            <span>Contact</span>
          </a>
          <a href="#" className={styles.footerLink}>
            <Description className={styles.icon} />
            <span>Terms and Conditions</span>
          </a>
          <a href="#" className={styles.footerLink}>
            <ReportProblem className={styles.icon} />
            <span>Complaints</span>
          </a>
          <a href="#" className={styles.footerLink}>
            <PrivacyTip className={styles.icon} />
            <span>GDPR Regulations</span>
          </a>
                    <a href="#" className={styles.footerLink}>
            <Info className={styles.icon} />
            <span>About Us</span>
          </a>
        </div>
    </div>
    <p className={styles.appInfo}>RentFlat V0.78 — created by Marius Ionut</p>
    </footer>
  )
}

export default FooterComponent
