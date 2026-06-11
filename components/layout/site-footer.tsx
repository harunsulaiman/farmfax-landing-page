import Link from "next/link";
import styles from "@/styles/modules/landing.module.css";

export function SiteFooter(): React.JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footerRich}>
      <div className={styles.footerGrid}>
        <div>
          <p className={styles.footerColTitle}>About Us</p>
          <ul className={styles.footerLinks}>
            <li>
              <Link href="/mission">Our mission</Link>
            </li>
            <li>
              <Link href="/team">Team</Link>
            </li>
            <li>
              <Link href="/careers">Careers</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className={styles.footerColTitle}>Contact Us</p>
          <ul className={styles.footerLinks}>
            <li>
              <Link href="/support">Support</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/partners">Partners</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className={styles.footerColTitle}>Address</p>
          <p className={styles.footerText}>
            DH-1069 Maiduguri,
            <br />
            Borno State, Nigeria
          </p>
        </div>
        <div>
          <p className={styles.footerColTitle}>Stay updated</p>
          <form className={styles.subscribeRow} action="#" method="post">
            <input
              type="email"
              className={styles.subscribeInput}
              placeholder="johndoe@gmail.com"
              aria-label="Email for updates"
            />
            <button type="submit" className={styles.subscribeBtn}>
              Subscribe
            </button>
          </form>
          <p className={styles.footerWordmark}>FARMFAX</p>
          <p className={styles.footerText}>
            +234 802 218 8861
            <br />
            info@farmfax.com.ng
          </p>
          <div className={styles.socialRow} aria-label="Social links">
            <span className={styles.socialDot}>f</span>
            <span className={styles.socialDot}>in</span>
            <span className={styles.socialDot}>ig</span>
          </div>
        </div>
      </div>
      <p className={styles.footerCopy}>
        © {year} FarmFax. All rights reserved.
      </p>
    </footer>
  );
}
