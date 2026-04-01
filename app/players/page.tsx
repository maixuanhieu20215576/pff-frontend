'use client';

import { useEffect, useState } from 'react';
import { getPlayers, createPlayer, updatePlayer } from '@/lib/api';
import { Player } from '@/lib/types';
import { UserPlus, Pencil, UserCircle2 } from 'lucide-react';
import styles from '@/css/players.module.css';
import { useAdmin } from '@/lib/useAdmin';

const STATUS_LABEL: Record<string, string> = { PLAYING: 'Đang thi đấu', RETIRED: 'Đã nghỉ' };
const SIZE_OPTIONS = ['L', 'XL', 'XLL'];

const emptyForm: Partial<Player> = {
  fullName: '',
  nickname: '',
  shirtNumber: undefined,
  shirtSize: undefined,
  imageUrl: '',
  isManager: false,
  status: 'PLAYING',
};

export default function PlayersPage() {
  const isAdmin = useAdmin();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<Partial<Player>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPlayers();
      setPlayers(data);
    } catch {
      setError('Không thể tải danh sách cầu thủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditPlayer(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Player) => { setEditPlayer(p); setForm(p); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editPlayer) {
        await updatePlayer(editPlayer.id, form);
      } else {
        await createPlayer(form);
      }
      setShowForm(false);
      load();
    } catch {
      setError('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <UserCircle2 size={28} strokeWidth={1.8} />
          Danh Sách Cầu Thủ
        </h1>
        {isAdmin && (
          <button onClick={openCreate} className={styles.addBtn}>
            <UserPlus size={16} />
            Thêm Cầu Thủ
          </button>
        )}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-green-600">Đang tải...</div>
      ) : (
        <div className={styles.grid}>
          {[...players].sort((a, b) => {
            const aR = a.status === 'RETIRED' ? 1 : 0;
            const bR = b.status === 'RETIRED' ? 1 : 0;
            return aR - bR;
          }).map((p) => (
            <div key={p.id} className={`${styles.card} ${p.status === 'RETIRED' ? styles.cardRetired : ''}`}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.fullName} className={styles.cardImg} />
              ) : (
                <div className={styles.cardImgPlaceholder}>
                  <UserCircle2 size={64} strokeWidth={1} />
                </div>
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardNameRow}>
                  <span className={styles.cardName}>{p.fullName}</span>
                  {p.shirtNumber && (
                    <span className={styles.shirtBadge}>#{p.shirtNumber}</span>
                  )}
                </div>
                {p.nickname && <p className={styles.nickname}>&ldquo;{p.nickname}&rdquo;</p>}
                <div className={styles.tags}>
                  {p.isManager && <span className={styles.tagManager}>Quản lý</span>}
                  <span className={p.status === 'PLAYING' ? styles.tagPlaying : styles.tagRetired}>
                    {STATUS_LABEL[p.status ?? 'PLAYING']}
                  </span>
                  {p.shirtSize && <span className={styles.tagSize}>Size {p.shirtSize}</span>}
                </div>
                {p.balance !== undefined && (
                  <div className={`${styles.balance} ${p.balance >= 0 ? styles.balancePos : styles.balanceNeg}`}>
                    Số dư: {p.balance?.toLocaleString('vi-VN')}đ
                  </div>
                )}
                {isAdmin && (
                  <button onClick={() => openEdit(p)} className={styles.editBtn}>
                    <Pencil size={13} />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {editPlayer ? <><Pencil size={18} /> Chỉnh Sửa Cầu Thủ</> : <><UserPlus size={18} /> Thêm Cầu Thủ Mới</>}
            </h2>
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Họ và tên *</label>
                <input className={styles.input} value={form.fullName ?? ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Biệt danh</label>
                <input className={styles.input} value={form.nickname ?? ''} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              </div>
              <div className={`${styles.formGroup} ${styles.row}`}>
                <div className={styles.flex1}>
                  <label className={styles.label}>Số áo</label>
                  <input type="number" className={styles.input} value={form.shirtNumber ?? ''} onChange={(e) => setForm({ ...form, shirtNumber: e.target.value ? parseInt(e.target.value) : undefined })} />
                </div>
                <div className={styles.flex1}>
                  <label className={styles.label}>Size áo</label>
                  <select className={styles.select} value={form.shirtSize ?? ''} onChange={(e) => setForm({ ...form, shirtSize: e.target.value as 'L' | 'XL' | 'XLL' | undefined })}>
                    <option value="">--</option>
                    {SIZE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>URL ảnh</label>
                <input className={styles.input} value={form.imageUrl ?? ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Trạng thái</label>
                <select className={styles.select} value={form.status ?? 'PLAYING'} onChange={(e) => setForm({ ...form, status: e.target.value as 'PLAYING' | 'RETIRED' })}>
                  <option value="PLAYING">Đang thi đấu</option>
                  <option value="RETIRED">Đã nghỉ</option>
                </select>
              </div>
              <div className={styles.checkRow}>
                <input type="checkbox" id="isManager" checked={form.isManager ?? false} onChange={(e) => setForm({ ...form, isManager: e.target.checked })} className="accent-green-600" />
                <label htmlFor="isManager" className={styles.label} style={{ margin: 0 }}>Là quản lý đội</label>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowForm(false)} className={styles.cancelBtn}>Hủy</button>
              <button onClick={handleSave} disabled={saving || !form.fullName} className={styles.saveBtn}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
