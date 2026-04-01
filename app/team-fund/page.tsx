'use client';

import { useEffect, useState } from 'react';
import { getBalance, getPlayers, getPlayerTransactions, createTransaction } from '@/lib/api';
import { Player, Transaction, CreateTransactionRequest } from '@/lib/types';
import { Wallet, PlusCircle, ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react';
import Image from 'next/image';
import styles from '@/css/team-fund.module.css';
import { useAdmin } from '@/lib/useAdmin';

const emptyForm: CreateTransactionRequest = {
  transactionType: 'IN',
  amount: 0,
  sourcePlayerId: undefined,
  description: '',
};

export default function TeamFundPage() {
  const isAdmin = useAdmin();
  const [balance, setBalance] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTransactionRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [bal, pls] = await Promise.all([getBalance(), getPlayers()]);
      setBalance(bal);
      setPlayers(pls);
    } catch {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadTransactions = async (playerId: number) => {
    setTxLoading(true);
    try {
      const txs = await getPlayerTransactions(playerId);
      setTransactions(txs);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleSelectPlayer = (id: number) => {
    setSelectedPlayer(id);
    loadTransactions(id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createTransaction(form);
      setShowForm(false);
      setForm(emptyForm);
      load();
      if (selectedPlayer) loadTransactions(selectedPlayer);
    } catch {
      setError('Ghi giao dịch thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <Wallet size={28} strokeWidth={1.8} />
          Quỹ Đội
        </h1>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className={styles.addBtn}>
            <PlusCircle size={16} />
            Ghi giao dịch
          </button>
        )}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>Số dư quỹ đội hiện tại</p>
        <p className={styles.balanceAmount}>
          {balance !== null ? balance.toLocaleString('vi-VN') + 'đ' : '...'}
        </p>
      </div>

      <div className={styles.bankQrCard}>
        <p className={styles.bankQrTitle}>Thông tin chuyển khoản</p>
        <div className={styles.bankQrImageWrap}>
          <Image
            src="/bank-qr.jpg"
            alt="QR chuyển khoản - Phạm Minh Hoàng 0589675609"
            width={320}
            height={692}
            className={styles.bankQrImage}
            priority
          />
        </div>
        <button
          className={styles.bankQrDownloadBtn}
          onClick={async () => {
            const res = await fetch('/bank-qr.jpg');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'QR-chuyen-khoan-PFF.jpg';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={15} />
          Tải ảnh QR
        </button>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Số dư cầu thủ</div>
          <div className={styles.playerList}>
            {loading ? (
              <div className="text-center py-8 text-green-600">Đang tải...</div>
            ) : (
              players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlayer(p.id)}
                  className={`${styles.playerItem} ${selectedPlayer === p.id ? styles.playerItemActive : ''}`}
                >
                  <span className={styles.playerName}>{p.fullName}</span>
                  <span className={(p.balance ?? 0) >= 0 ? styles.playerBalPos : styles.playerBalNeg}>
                    {(p.balance ?? 0).toLocaleString('vi-VN')}đ
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            {selectedPlayer
              ? `Lịch sử giao dịch — ${players.find((p) => p.id === selectedPlayer)?.fullName}`
              : 'Chọn cầu thủ để xem lịch sử'}
          </div>
          <div style={{ overflowX: 'auto' }}>
            {txLoading ? (
              <div className="text-center py-10 text-green-600">Đang tải...</div>
            ) : !selectedPlayer ? (
              <div className="text-center py-10 text-gray-400">Chọn một cầu thủ để xem lịch sử giao dịch</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Chưa có giao dịch nào</div>
            ) : (
              <table className={styles.txTable}>
                <thead className={styles.txHead}>
                  <tr>
                    <th>Ngày</th>
                    <th>Loại</th>
                    <th>Số tiền</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className={styles.txRow}>
                      <td style={{ color: '#6b7280' }}>{tx.date}</td>
                      <td>
                        <span className={tx.transactionType === 'IN' ? styles.txIn : styles.txOut}>
                          {tx.transactionType === 'IN'
                            ? <><ArrowDownCircle size={10} style={{ display: 'inline', marginRight: 2 }} />Thu</>
                            : <><ArrowUpCircle size={10} style={{ display: 'inline', marginRight: 2 }} />Chi</>}
                        </span>
                      </td>
                      <td className={tx.transactionType === 'IN' ? styles.txAmountIn : styles.txAmountOut}>
                        {tx.transactionType === 'IN' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td style={{ color: '#4b5563' }}>{tx.description ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isAdmin && showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              <PlusCircle size={20} />
              Ghi Giao Dịch Mới
            </h2>
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Loại giao dịch</label>
                <select
                  className={styles.select}
                  value={form.transactionType}
                  onChange={(e) => setForm({ ...form, transactionType: e.target.value as 'IN' | 'OUT' })}
                >
                  <option value="IN">Thu tiền</option>
                  <option value="OUT">Chi tiền</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Số tiền (VNĐ)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={form.amount ? form.amount.toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                    setForm({ ...form, amount: raw ? parseInt(raw) : 0 });
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cầu thủ liên quan</label>
                <select
                  className={styles.select}
                  value={form.sourcePlayerId ?? ''}
                  onChange={(e) => setForm({ ...form, sourcePlayerId: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                  <option value="">-- Không chọn --</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Ghi chú</label>
                <input
                  className={styles.input}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowForm(false)} className={styles.cancelBtn}>Hủy</button>
              <button onClick={handleSave} disabled={saving || !form.amount} className={styles.saveBtn}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
