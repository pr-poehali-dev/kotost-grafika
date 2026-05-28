import { useState, useEffect, useRef, useCallback } from "react";
import { CH2_ENDINGS, DAY_DURATION_MS, DECAY, clamp } from "./gameTypes";
import type { Ch2Ending } from "./gameTypes";
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

export function Chapter2({ ch2Obtained, setCh2Obtained }: {
  ch2Obtained: Set<Ch2Ending>;
  setCh2Obtained: React.Dispatch<React.SetStateAction<Set<Ch2Ending>>>;
}) {
  const [day, setDay] = useState(1);
  const [stats, setStats] = useState({ hunger: 80, cleanliness: 80, energy: 80, mood: 80 });
  const [dayProgress, setDayProgress] = useState(0); // 0..1 внутри текущего дня
  const [showTransition, setShowTransition] = useState(false);
  const [transitionFrom, setTransitionFrom] = useState(1);
  const [catRanAway, setCatRanAway] = useState<string | null>(null);
  const [activeEnding, setActiveEnding] = useState<Ch2Ending | null>(null);
  const [gameActive] = useState(true);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dayStartRef = useRef<number>(Date.now());

  // Запуск/остановка тика
  useEffect(() => {
    if (!gameActive || showTransition || catRanAway || activeEnding) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    dayStartRef.current = Date.now();
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - dayStartRef.current;
      const pct = Math.min(elapsed / DAY_DURATION_MS, 1);
      setDayProgress(pct);

      setStats((s) => {
        const next = {
          hunger:      clamp(s.hunger      - DECAY.hunger),
          cleanliness: clamp(s.cleanliness - DECAY.cleanliness),
          energy:      clamp(s.energy      - DECAY.energy),
          mood:        clamp(s.mood        - DECAY.mood),
        };
        // Котость уходит если голод или чистота = 0
        if (next.hunger <= 0) {
          setCatRanAway("Котость была очень голодна, и вы не покормили её.");
          return s;
        }
        if (next.cleanliness <= 0) {
          setCatRanAway("Котость была такая грязная, что убежала купаться самостоятельно.");
          return s;
        }
        return next;
      });

      if (pct >= 1) {
        // День окончен → переход
        setTransitionFrom(day);
        setShowTransition(true);
      }
    }, 1000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [gameActive, showTransition, catRanAway, activeEnding, day]);

  const handleDayDone = useCallback(() => {
    setShowTransition(false);
    const nextDay = transitionFrom + 1;
    setDay(nextDay);
    setDayProgress(0);
    dayStartRef.current = Date.now();
    // Восстановить немного энергии после сна
    setStats((s) => ({ ...s, energy: clamp(s.energy + 30) }));

    // Проверяем концовки
    const newDay = transitionFrom; // сколько дней прожили
    let earned: Ch2Ending | null = null;
    if (newDay >= 15 && !ch2Obtained.has("days15")) earned = "days15";
    else if (newDay >= 10 && !ch2Obtained.has("days10")) earned = "days10";
    else if (newDay >= 5 && !ch2Obtained.has("days5")) earned = "days5";

    if (earned) {
      setCh2Obtained((old) => new Set([...old, earned!]));
      setTimeout(() => setActiveEnding(earned), 300);
    }
  }, [transitionFrom, ch2Obtained, setCh2Obtained]);

  const handleCatBack = () => {
    setCatRanAway(null);
    setDay(1);
    setDayProgress(0);
    setStats({ hunger: 80, cleanliness: 80, energy: 80, mood: 80 });
    dayStartRef.current = Date.now();
  };

  const feed  = () => setStats((s) => ({ ...s, hunger: clamp(s.hunger + 30), mood: clamp(s.mood + 5) }));
  const wash  = () => setStats((s) => ({ ...s, cleanliness: clamp(s.cleanliness + 35) }));
  const sleep = () => setStats((s) => ({ ...s, energy: clamp(s.energy + 40), mood: clamp(s.mood + 10) }));
  const play  = () => setStats((s) => ({ ...s, mood: clamp(s.mood + 25), energy: clamp(s.energy - 10) }));

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
      {activeEnding && <Ch2EndingModal ending={activeEnding} onClose={() => setActiveEnding(null)} />}
    </>
  );
}
