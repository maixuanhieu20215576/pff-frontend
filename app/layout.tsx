'use client';

import './globals.css';
// viewport meta is handled via <meta> in the html head below
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Trophy, Wallet, ClipboardList, Volleyball, Menu, X } from 'lucide-react';
import { Nunito } from 'next/font/google';
import styles from '@/css/layout.module.css';
import { useState, useRef } from 'react';

const nunito = Nunito({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

const navItems = [
  { href: '/players', label: 'Cầu Thủ', icon: Users },
  { href: '/season-summary', label: 'Tổng Kết Mùa Giải', icon: Trophy },
  { href: '/team-fund', label: 'Quỹ Đội', icon: Wallet },
  { href: '/match-record', label: 'Lịch Sử Trận Đấu', icon: ClipboardList },
];

function Header() {
  const pathname = usePathname();
  const [showEaster, setShowEaster] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const clickCount = useRef(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    clickCount.current += 1;
    if (clickCount.current === 1) return; // first click navigates normally
    e.preventDefault();
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      localStorage.setItem('isAdmin', 'true');
      setShowEaster(true);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo} onClick={handleLogoClick}>
            <Volleyball size={26} className={styles.logoIcon} />
            <span>PFF Management</span>
          </Link>
          <nav className={styles.nav}>
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <nav className={styles.mobileNav}>
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {showEaster && (
        <div className={styles.easterOverlay}>
          <div className={styles.easterBox}>
            <div className={styles.easterIcon}>😈</div>
            <p className={styles.easterText}>Bạn đã trở thành admin rồi đấy!</p>
            <button className={styles.easterBtn} onClick={() => setShowEaster(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={nunito.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={styles.body}>
        <Header />
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}
