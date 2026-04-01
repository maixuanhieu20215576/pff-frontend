import Link from 'next/link';
import { Users, Trophy, Wallet, ClipboardList, Volleyball } from 'lucide-react';
import styles from '@/css/home.module.css';

const sections = [
  { href: '/players', icon: Users, label: 'Cầu Thủ', desc: 'Quản lý danh sách cầu thủ' },
  { href: '/season-summary', icon: Trophy, label: 'Tổng Kết Mùa Giải', desc: 'Bảng xếp hạng & thống kê mùa giải' },
  { href: '/team-fund', icon: Wallet, label: 'Quỹ Đội', desc: 'Theo dõi thu chi quỹ đội' },
  { href: '/match-record', icon: ClipboardList, label: 'Lịch Sử Trận Đấu', desc: 'Kết quả & chi tiết các trận đấu' },
];

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <Volleyball size={64} strokeWidth={1.5} />
        </div>
        <h1 className={styles.heroTitle}>PFF Management</h1>
        <p className={styles.heroSub}>Hệ thống quản lý đội bóng</p>
      </div>
      <div className={styles.grid}>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className={styles.card}>
              <span className={styles.cardIcon}>
                <Icon size={32} strokeWidth={1.5} />
              </span>
              <span className={styles.cardLabel}>{s.label}</span>
              <span className={styles.cardDesc}>{s.desc}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
