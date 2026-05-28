import { useEffect, useRef, useCallback } from "react";
import { CH2_ENDINGS, DAY_DURATION_MS, TICK_INTERVAL_MS, DECAY_PER_TICK, clamp, INITIAL_CH2_STATE } from "./gameTypes";
import type { Ch2Ending, Ch2State } from "./gameTypes";
import { Ch2EndingModal, CatRanAwayModal, DayTransition } from "./GameModals";

// ─── STAT BAR ─────────────────────────────────────────────────────────────────

function StatBar({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const pct = Math.round(value);
  const danger = pct < 25;
  return (
    <div className="stat2-row">
      <span className="stat2-icon">{icon}</span>
      <span className="stat2-label">{label}</span>
      <div className="stat2-track">
        <div className="stat2-fill" style={{ width: `${pct}%`, background: danger ? "#ef4444" : color, transition: "width 0.4s ease" }} />
      </div>
      <span className="stat2-val" style={{ color: danger ? "#ef4444" : "#9ca3af" }}>{pct}%</span>
    </div>
  );
}

// ─── CHAPTER 2 ────────────────────────────────────────────────────────────────
// Всё состояние живёт в родителе (Index) — смена вкладки НЕ сбрасывает прогресс.
// Тик работает через useEffect здесь, но state хранится снаружи.

interface Chapter2Props {
  ch2State: Ch2State;
  setCh2State: React.Dispatch<React.SetStateAction<Ch2State>>;
  ch2Obtained: Set<Ch2Ending>;
  setCh2Obtained: React.Dispatch<React.SetStateAction<Set<Ch2Ending>>>;
}

export function Chapter2({ ch2State, setCh2State, ch2Obtained, setCh2Obtained }: Chapter2Props) {
  const { day, stats, dayProgress, showTransition, transitionFrom, catRanAway, activeEnding } = ch2State;

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dayStartRef = useRef<number>(ch2State.dayStartTs || Date.now());

  // Синхронизируем ref при восстановлении из сохранения
  useEffect(() => {
    if (ch2State.dayStartTs) dayStartRef.current = ch2State.dayStartTs;
  }, []);

  // Тик — всегда активен пока нет паузы (переход/уход/концовка)
  useEffect(() => {
    if (showTransition || catRanAway || activeEnding) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    // Возобновляем — пересчитываем реальное время старта дня
    const now = Date.now();
    const elapsed = Math.min(now - dayStartRef.current, DAY_DURATION_MS);
    const startPct = elapsed / DAY_DURATION_MS;

    tickRef.current = setInterval(() => {
      const nowTs = Date.now();
      const pct = Math.min((nowTs - dayStartRef.current) / DAY_DURATION_MS, 1);

      setCh2State((s) => {
        if (s.showTransition || s.catRanAway || s.activeEnding) return s;

        const next = {
          hunger:      clamp(s.stats.hunger      - DECAY_PER_TICK),
          cleanliness: clamp(s.stats.cleanliness - DECAY_PER_TICK),
          energy:      clamp(s.stats.energy      - DECAY_PER_TICK * 0.7),
          mood:        clamp(s.stats.mood        - DECAY_PER_TICK * 0.5),
        };

        // Котость уходит если голод или чистота = 0
        if (next.hunger <= 0) {
          return { ...s, stats: next, catRanAway: "Котость была очень голодна, и вы не покормили её." };
        }
        if (next.cleanliness <= 0) {
          return { ...s, stats: next, catRanAway: "Котость была такая грязная, что убежала купаться самостоятельно." };
        }

        if (pct >= 1) {
          return { ...s, stats: next, dayProgress: 1, showTransition: true, transitionFrom: s.day };
        }

        return { ...s, stats: next, dayProgress: pct };
      });
    }, TICK_INTERVAL_MS);

    // Сразу обновляем прогресс при монтировании чтобы не было прыжка
    setCh2State((s) => ({ ...s, dayProgress: startPct }));

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [showTransition, catRanAway, activeEnding, setCh2State]);

  const handleDayDone = useCallback(() => {
    const nextDay = transitionFrom + 1;
    dayStartRef.current = Date.now();

    const newDay = transitionFrom;
    let earned: Ch2Ending | null = null;
    if (newDay >= 15 && !ch2Obtained.has("days15")) earned = "days15";
    else if (newDay >= 10 && !ch2Obtained.has("days10")) earned = "days10";
    else if (newDay >= 5 && !ch2Obtained.has("days5")) earned = "days5";

    if (earned) {
      setCh2Obtained((old) => new Set([...old, earned!]));
      setCh2State((s) => ({
        ...s,
        day: nextDay,
        dayProgress: 0,
        showTransition: false,
        stats: { ...s.stats, energy: clamp(s.stats.energy + 30) },
        activeEnding: earned,
        dayStartTs: dayStartRef.current,
      }));
    } else {
      setCh2State((s) => ({
        ...s,
        day: nextDay,
        dayProgress: 0,
        showTransition: false,
        stats: { ...s.stats, energy: clamp(s.stats.energy + 30) },
        dayStartTs: dayStartRef.current,
      }));
    }
  }, [transitionFrom, ch2Obtained, setCh2Obtained, setCh2State]);

  const handleCatBack = () => {
    dayStartRef.current = Date.now();
    setCh2State({ ...INITIAL_CH2_STATE, dayStartTs: dayStartRef.current });
  };

  const feed  = () => setCh2State((s) => ({ ...s, stats: { ...s.stats, hunger: clamp(s.stats.hunger + 30), mood: clamp(s.stats.mood + 5) } }));
  const wash  = () => setCh2State((s) => ({ ...s, stats: { ...s.stats, cleanliness: clamp(s.stats.cleanliness + 35) } }));
  const sleep = () => setCh2State((s) => ({ ...s, stats: { ...s.stats, energy: clamp(s.stats.energy + 40), mood: clamp(s.stats.mood + 10) } }));
  const play  = () => setCh2State((s) => ({ ...s, stats: { ...s.stats, mood: clamp(s.stats.mood + 25), energy: clamp(s.stats.energy - 10) } }));

  const catEmoji = stats.mood > 60 ? "😸" : stats.mood > 30 ? "😼" : "😿";
  const dayPct = Math.round(dayProgress * 100);

  return (
    <>
      <div className="ch2-wrapper">
        <div className="ch2-header-row">
          <div className="ch2-day-badge">📅 День {day}</div>
          <div className="ch2-day-timer">
            <div className="ch2-timer-track">
              <div className="ch2-timer-fill" style={{ width: `${dayPct}%` }} />
            </div>
            <span className="ch2-timer-label">{dayPct}% дня</span>
          </div>
        </div>

        <div className="ch2-cat-display">
          <div className="ch2-cat-emoji">{catEmoji}</div>
          <div className="ch2-cat-name">Котость</div>
        </div>

        <div className="ch2-stats">
          <StatBar label="Голод"      value={stats.hunger}      icon="🍖" color="#f97316" />
          <StatBar label="Чистота"    value={stats.cleanliness} icon="🛁" color="#06b6d4" />
          <StatBar label="Энергия"    value={stats.energy}      icon="⚡" color="#eab308" />
          <StatBar label="Настроение" value={stats.mood}        icon="💛" color="#a855f7" />
        </div>

        <div className="ch2-actions">
          <button className="ch2-btn" onClick={feed}>🍖<br/>Покормить</button>
          <button className="ch2-btn" onClick={wash}>🛁<br/>Помыть</button>
          <button className="ch2-btn" onClick={sleep}>💤<br/>Спать</button>
          <button className="ch2-btn" onClick={play}>🎮<br/>Играть</button>
        </div>

        {ch2Obtained.size > 0 && (
          <div className="progress-bar-wrap" style={{ marginTop: "1rem" }}>
            <div className="progress-label">Концовок Главы 2: {ch2Obtained.size}/3</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.round(ch2Obtained.size / 3 * 100)}%`, background: "linear-gradient(90deg,#22c55e,#06b6d4)" }} />
            </div>
          </div>
        )}
      </div>

      {showTransition && <DayTransition from={transitionFrom} to={transitionFrom + 1} onDone={handleDayDone} />}
      {catRanAway && <CatRanAwayModal reason={catRanAway} onClose={handleCatBack} />}
      {activeEnding && <Ch2EndingModal ending={activeEnding} onClose={() => setCh2State((s) => ({ ...s, activeEnding: null }))} />}
    </>
  );
}
