"use client";

import { useEffect, useState, useMemo } from "react";
import { getSeasonSummaries } from "@/lib/api";
import { SeasonSummary } from "@/lib/types";
import { Trophy, Goal, Handshake, Flame, Star, LayoutList, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import styles from "@/css/season-summary.module.css";

type SortKey = "goalScored" | "goalAssisted" | "ga" | "numberOfMvp";
type SortDir = "desc" | "asc";

function Badge({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span className={styles.badge}>
      {icon} {label}
    </span>
  );
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown size={13} className={styles.sortIconInactive} />;
  return sortDir === "desc"
    ? <ChevronDown size={13} className={styles.sortIconActive} />
    : <ChevronUp size={13} className={styles.sortIconActive} />;
}

export default function SeasonSummaryPage() {
  const [summaries, setSummaries] = useState<SeasonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("ga");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [error, setError] = useState("");

  useEffect(() => {
    getSeasonSummaries()
      .then(setSummaries)
      .catch(() => setError("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const seasons = useMemo(() => {
    const s = Array.from(new Set(summaries.map((x) => x.season)))
      .sort()
      .reverse();
    return s;
  }, [summaries]);

  const filtered = useMemo(() => {
    const base = summaries.filter((x) => x.playerName && x.playerName.trim() !== "");

    let list: (SeasonSummary & { ga: number })[];

    if (selectedSeason === "all") {
      // Merge stats per player across all seasons
      const map = new Map<string, SeasonSummary & { ga: number }>();
      for (const row of base) {
        const existing = map.get(row.playerName);
        if (existing) {
          existing.goalScored += row.goalScored;
          existing.goalAssisted += row.goalAssisted;
          existing.numberOfMvp += row.numberOfMvp;
          existing.ga = existing.goalScored + existing.goalAssisted;
        } else {
          map.set(row.playerName, { ...row, ga: row.goalScored + row.goalAssisted });
        }
      }
      list = Array.from(map.values());
    } else {
      list = base
        .filter((x) => x.season === selectedSeason)
        .map((x) => ({ ...x, ga: x.goalScored + x.goalAssisted }));
    }

    return [...list].sort((a, b) => {
      const aVal = sortKey === "ga" ? a.ga : a[sortKey];
      const bVal = sortKey === "ga" ? b.ga : b[sortKey];
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [summaries, selectedSeason, sortKey, sortDir]);

  const topGoalStat = useMemo(
    () => filtered.reduce((max, x) => Math.max(max, x.goalScored), 0),
    [filtered],
  );
  const topAssistStat = useMemo(
    () => filtered.reduce((max, x) => Math.max(max, x.goalAssisted), 0),
    [filtered],
  );
  const topGAStat = useMemo(
    () => filtered.reduce((max, x) => Math.max(max, x.ga), 0),
    [filtered],
  );
  const topMvpStat = useMemo(
    () => filtered.reduce((max, x) => Math.max(max, x.numberOfMvp), 0),
    [filtered],
  );

  const topGoalPlayers = useMemo(
    () =>
      filtered.filter((x) => x.goalScored === topGoalStat && topGoalStat > 0),
    [filtered, topGoalStat],
  );
  const topAssistPlayers = useMemo(
    () =>
      filtered.filter(
        (x) => x.goalAssisted === topAssistStat && topAssistStat > 0,
      ),
    [filtered, topAssistStat],
  );
  const topGAPlayers = useMemo(
    () => filtered.filter((x) => x.ga === topGAStat && topGAStat > 0),
    [filtered, topGAStat],
  );
  const topMvpPlayers = useMemo(
    () =>
      filtered.filter((x) => x.numberOfMvp === topMvpStat && topMvpStat > 0),
    [filtered, topMvpStat],
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <span className={styles.iconTrophy}><Trophy size={28} strokeWidth={1.8} /></span>
          Tổng Kết Mùa Giải
        </h1>
        <select
          className={styles.seasonSelect}
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="all">Tất cả mùa giải</option>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-20 text-green-600">Đang tải...</div>
      ) : (
        <>
          <div className={styles.statCards}>
            {[
              {
                icon: <span className={styles.iconBall}><Goal size={22} strokeWidth={1.8} /></span>,
                label: "Vua phá lưới",
                players: topGoalPlayers,
                stat: topGoalStat,
                unit: "bàn",
              },
              {
                icon: <span className={styles.iconHandshake}><Handshake size={22} strokeWidth={1.8} /></span>,
                label: "Vua kiến tạo",
                players: topAssistPlayers,
                stat: topAssistStat,
                unit: "kiến tạo",
              },
              {
                icon: <span className={styles.iconFlame}><Flame size={22} strokeWidth={1.8} /></span>,
                label: "G/A cao nhất",
                players: topGAPlayers,
                stat: topGAStat,
                unit: "G/A",
              },
              {
                icon: <span className={styles.iconStar}><Star size={22} strokeWidth={1.8} /></span>,
                label: "MVP nhiều nhất",
                players: topMvpPlayers,
                stat: topMvpStat,
                unit: "lần",
              },
            ].map((card) => (
              <div key={card.label} className={styles.statCard}>
                <div className={styles.statCardIcon}>
                  {card.icon}
                </div>
                <div className={styles.statCardLabel}>{card.label}</div>
                <div className={styles.statCardNames}>
                  {card.players.length > 0
                    ? card.players.map((p) => p.playerName).join(", ")
                    : "—"}
                </div>
                <div className={styles.statCardValue}>{card.stat}</div>
                <div className={styles.statCardUnit}>{card.unit}</div>
              </div>
            ))}
          </div>

          <div className={styles.leaderboard}>
            <div className={styles.leaderboardHeader}>
              <span className={styles.iconList}><LayoutList size={18} /></span>
              Bảng Xếp Hạng
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th>Cầu thủ</th>
                    {selectedSeason !== "all" && <th>Mùa giải</th>}
                    <th className={styles.sortableTh} onClick={() => handleSort("goalScored")}>
                      Bàn thắng <SortIcon column="goalScored" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className={styles.sortableTh} onClick={() => handleSort("goalAssisted")}>
                      Kiến tạo <SortIcon column="goalAssisted" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className={styles.sortableTh} onClick={() => handleSort("ga")}>
                      G/A <SortIcon column="ga" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th className={styles.sortableTh} onClick={() => handleSort("numberOfMvp")}>
                      MVP <SortIcon column="numberOfMvp" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => {
                    const ga = row.ga;
                    const isTopGoal = topGoalPlayers.some(
                      (p) => p.playerName === row.playerName,
                    );
                    const isTopAssist = topAssistPlayers.some(
                      (p) => p.playerName === row.playerName,
                    );
                    const isTopGA = topGAPlayers.some((p) => p.playerName === row.playerName);
                    const isTopMvp = topMvpPlayers.some((p) => p.playerName === row.playerName);
                    const medalClass = idx === 0 ? styles.tableRowGold : idx === 1 ? styles.tableRowSilver : idx === 2 ? styles.tableRowBronze : "";
                    return (
                      <tr
                        key={selectedSeason === "all" ? row.playerName : row.id}
                        className={`${styles.tableRow} ${medalClass}`}
                      >
                        <td className={styles.nameCell}>
                          {row.playerName}
                          {isTopGoal && (
                            <Badge
                              icon={<Goal size={9} />}
                              label="Vua phá lưới"
                            />
                          )}
                          {isTopAssist && (
                            <Badge
                              icon={<Handshake size={9} />}
                              label="Vua kiến tạo"
                            />
                          )}
                          {isTopGA && (
                            <Badge icon={<Flame size={9} />} label="G/A" />
                          )}
                          {isTopMvp && (
                            <Badge icon={<Star size={9} />} label="MVP" />
                          )}
                        </td>
                        {selectedSeason !== "all" && (
                          <td className={styles.seasonCell}>{row.season}</td>
                        )}
                        <td className={`${styles.centerCell} ${styles.goals}`}>
                          {row.goalScored}
                        </td>
                        <td
                          className={`${styles.centerCell} ${styles.assists}`}
                        >
                          {row.goalAssisted}
                        </td>
                        <td className={`${styles.centerCell} ${styles.ga}`}>
                          {ga}
                        </td>
                        <td className={`${styles.centerCell} ${styles.mvp}`}>
                          {row.numberOfMvp}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-gray-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
