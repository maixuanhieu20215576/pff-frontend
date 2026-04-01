'use client';

import { useEffect, useState } from 'react';
import { getMatchRecords, createMatchRecord, deleteMatchRecord, getPlayers } from '@/lib/api';
import { MatchRecord, Player } from '@/lib/types';
import { ClipboardList, Plus, Trash2, ChevronDown, ChevronUp, Star, Goal, Handshake } from 'lucide-react';
import styles from '@/css/match-record.module.css';
import { useAdmin } from '@/lib/useAdmin';

const OUTCOME_LABEL: Record<string, { label: string; cls: string }> = {
  WIN: { label: 'Thắng', cls: styles.badgeWin },
  LOSE: { label: 'Thua', cls: styles.badgeLose },
  DRAW: { label: 'Hòa', cls: styles.badgeDraw },
};

export default function MatchRecordPage() {
  const isAdmin = useAdmin();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [matchResult, setMatchResult] = useState('');
  const [season, setSeason] = useState('');
  const [matchFee, setMatchFee] = useState('');
  const [mvp, setMvp] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [goalDetails, setGoalDetails] = useState<{ playerScoredName: string; playerAssistedName: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [ms, ps] = await Promise.all([getMatchRecords(), getPlayers()]);
      setMatches(ms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setPlayers(ps);
    } catch {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setDate(''); setTime(''); setMatchResult(''); setSeason('');
    setMatchFee(''); setMvp(''); setSelectedPlayerIds([]); setGoalDetails([]);
  };

  const togglePlayer = (id: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addGoal = () => setGoalDetails((prev) => [...prev, { playerScoredName: '', playerAssistedName: '' }]);
  const removeGoal = (i: number) => setGoalDetails((prev) => prev.filter((_, idx) => idx !== i));
  const updateGoal = (i: number, field: string, val: string) => {
    setGoalDetails((prev) => prev.map((g, idx) => idx === i ? { ...g, [field]: val } : g));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createMatchRecord({
        date,
        time: time || undefined,
        matchResult,
        season,
        matchFee: matchFee ? parseFloat(matchFee) : undefined,
        mvpPlayerName: mvp || undefined,
        playerIds: selectedPlayerIds,
        goalDetails: goalDetails.filter((g) => g.playerScoredName),
      });
      setShowForm(false);
      resetForm();
      load();
    } catch {
      setError('Lưu trận đấu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa trận đấu này?')) return;
    try {
      await deleteMatchRecord(id);
      load();
    } catch {
      setError('Xóa thất bại');
    }
  };

  const playerNames = players.map((p) => p.fullName);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <ClipboardList size={28} strokeWidth={1.8} />
          Lịch Sử Trận Đấu
        </h1>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className={styles.addBtn}>
            <Plus size={16} />
            Thêm trận đấu
          </button>
        )}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-green-600">Đang tải...</div>
      ) : (
        <div className={styles.matchList}>
          {matches.map((m) => {
            const outcome = m.matchOutcome ? OUTCOME_LABEL[m.matchOutcome] : null;
            const isExpanded = expanded === m.id;
            return (
              <div key={m.id} className={styles.matchCard}>
                <div className={styles.matchRow} onClick={() => setExpanded(isExpanded ? null : m.id)}>
                  <div className={styles.matchLeft}>
                    <div className={styles.matchDate}>
                      <div className={styles.matchDateText}>{m.date}</div>
                      {m.time && <div className={styles.matchDateText}>{m.time}</div>}
                    </div>
                    <div className={styles.matchScore}>{m.matchResult ?? '—'}</div>
                    {outcome && <span className={outcome.cls}>{outcome.label}</span>}
                    {m.season && <span className={styles.seasonTag}>{m.season}</span>}
                  </div>
                  <div className={styles.matchRight}>
                    {m.mvpPlayerName && (
                      <span className={styles.mvpTag}>
                        <Star size={11} fill="currentColor" />
                        {m.mvpPlayerName}
                      </span>
                    )}
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className={styles.deleteBtn}>
                        <Trash2 size={14} />
                      </button>
                    )}
                    <span className={styles.chevron}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedPanel}>
                    <div className={styles.expandedGrid}>
                      <div>
                        <h3 className={styles.sectionTitle}>
                          <Goal size={14} />
                          Chi tiết bàn thắng
                        </h3>
                        {m.goalDetails && m.goalDetails.length > 0 ? (
                          <table className={styles.goalTable}>
                            <thead className={styles.goalTableHead}>
                              <tr><th>Ghi bàn</th><th>Kiến tạo</th></tr>
                            </thead>
                            <tbody>
                              {m.goalDetails.map((g, i) => (
                                <tr key={i} className={styles.goalRow}>
                                  <td className={styles.goalScorer}>{g.playerScoredName ?? '—'}</td>
                                  <td className={styles.goalAssist}>{g.playerAssistedName ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-gray-400 text-xs">Không có chi tiết</p>
                        )}
                      </div>
                      <div>
                        <h3 className={styles.sectionTitle}>
                          <Handshake size={14} />
                          Cầu thủ tham gia
                        </h3>
                        <div className={styles.playerTags}>
                          {m.playerIds && m.playerIds.length > 0
                            ? m.playerIds.map((pid) => {
                                const p = players.find((x) => x.id === pid);
                                return (
                                  <span key={pid} className={styles.playerTag}>
                                    {p?.fullName ?? `#${pid}`}
                                  </span>
                                );
                              })
                            : <span className="text-gray-400 text-xs">Không có thông tin</span>
                          }
                        </div>
                        {m.matchFee !== undefined && (
                          <p className={styles.feeText}>Phí trận: {m.matchFee?.toLocaleString('vi-VN')}đ/người</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {matches.length === 0 && (
            <div className="text-center py-20 text-gray-400">Chưa có trận đấu nào được ghi nhận</div>
          )}
        </div>
      )}

      {isAdmin && showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              <Plus size={20} />
              Thêm Trận Đấu Mới
            </h2>
            <div>
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label}>Ngày thi đấu *</label>
                  <input type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>Giờ thi đấu</label>
                  <input type="time" className={styles.input} value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div className={styles.grid2} style={{ marginTop: '0.75rem' }}>
                <div>
                  <label className={styles.label}>Tỷ số (VD: 3-1) *</label>
                  <input className={styles.input} placeholder="3-1" value={matchResult} onChange={(e) => setMatchResult(e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>Mùa giải</label>
                  <input className={styles.input} placeholder="2024-2025" value={season} onChange={(e) => setSeason(e.target.value)} />
                </div>
              </div>
              <div className={styles.grid2} style={{ marginTop: '0.75rem' }}>
                <div>
                  <label className={styles.label}>Phí trận (đ/người)</label>
                  <input type="number" className={styles.input} value={matchFee} onChange={(e) => setMatchFee(e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>MVP</label>
                  <input list="player-list" className={styles.input} value={mvp} onChange={(e) => setMvp(e.target.value)} />
                  <datalist id="player-list">
                    {playerNames.map((n) => <option key={n} value={n} />)}
                  </datalist>
                </div>
              </div>

              <div className={styles.formSection} style={{ marginTop: '0.75rem' }}>
                <label className={styles.label}>Cầu thủ tham gia</label>
                <div className={styles.playerPicker}>
                  {players.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlayer(p.id)}
                      className={`${styles.playerChip} ${selectedPlayerIds.includes(p.id) ? styles.playerChipActive : ''}`}
                    >
                      {p.fullName}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.goalHeader}>
                  <label className={styles.label} style={{ margin: 0 }}>Chi tiết bàn thắng</label>
                  <button type="button" onClick={addGoal} className={styles.addGoalBtn}>
                    <Plus size={13} />
                    Thêm bàn
                  </button>
                </div>
                {goalDetails.map((g, i) => (
                  <div key={i} className={styles.goalEntry}>
                    <input
                      list="player-list"
                      placeholder="Cầu thủ ghi bàn"
                      className={styles.goalInput}
                      value={g.playerScoredName}
                      onChange={(e) => updateGoal(i, 'playerScoredName', e.target.value)}
                    />
                    <input
                      list="player-list"
                      placeholder="Kiến tạo (nếu có)"
                      className={styles.goalInput}
                      value={g.playerAssistedName}
                      onChange={(e) => updateGoal(i, 'playerAssistedName', e.target.value)}
                    />
                    <button type="button" onClick={() => removeGoal(i)} className={styles.removeGoalBtn}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => { setShowForm(false); resetForm(); }} className={styles.cancelBtn}>Hủy</button>
              <button onClick={handleSave} disabled={saving || !date || !matchResult} className={styles.saveBtn}>
                {saving ? 'Đang lưu...' : 'Lưu trận đấu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
