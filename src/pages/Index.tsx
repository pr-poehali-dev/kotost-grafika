import { useState, useEffect, useRef, useCallback } from "react";
import { useUnisender } from "@/components/extensions/unisender-go/useUnisender";

const UNISENDER_URL = "https://functions.poehali.dev/6b87f2ee-3635-45cb-8cd7-e0389c0354e9";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Theme = "dark" | "light" | "custom";
type Ch1Ending = "good" | "bad" | "terrible" | "mercy" | "king";
type Ch2Ending = "days5" | "days10" | "days15";
type MainTab = "ch1" | "ch2" | "ch3" | "settings";

const CAT_EMOJIS = ["😺","😸","😹","😻","😼","😽","🐱","🙀","😿","😾","🐈","🐾","💛","🧡","🫶","✨","💫","🌟","🐈‍⬛","❤️"];

// ─── CH1 DATA ─────────────────────────────────────────────────────────────────

const CH1_ENDINGS: Record<Ch1Ending, { title: string; text: string; color: string; icon: string; rarity: string }> = {
  good:    { title: "Хорошая концовка",      text: "Вы забрали Котость домой, и она теперь живёт у вас. Поздравляем с хорошей концовкой.",                                               color: "#f97316", icon: "🏠", rarity: "Обычная"    },
  bad:     { title: "Плохая концовка",        text: "Котость осталась на улице, и вы ушли домой, не забрав её. Ей грустно.",                                                               color: "#6b7280", icon: "😿", rarity: "Обычная"    },
  terrible:{ title: "Ужасная концовка",       text: "Вы не забирали Котость домой, несмотря на то, что она так хотела. Ей очень грустно.",                                                color: "#dc2626", icon: "💔", rarity: "Скрытая"    },
  mercy:   { title: "Концовка Милосердия",    text: "Вы всё-таки забрали Котость домой из-за жалости. Теперь она живёт у вас.",                                                           color: "#7c3aed", icon: "💜", rarity: "Скрытая"    },
  king:    { title: "Король Котостей",        text: "Вы увидели все грани истории Котости. Она признаёт вас своим Королём. Все концовки получены — вы прошли Главу 1 полностью!",          color: "#f59e0b", icon: "👑", rarity: "Легендарная"},
};

// ─── CH2 DATA ─────────────────────────────────────────────────────────────────

const CH2_ENDINGS: Record<Ch2Ending, { title: string; text: string; color: string; icon: string; rarity: string; days: number }> = {
  days5:  { title: "Первые шаги",    text: "Вы прожили 5 дней с Котостью! Она начинает вам доверять и мурчит по вечерам.",                                  color: "#22c55e", icon: "🌱", rarity: "Обычная", days: 5  },
  days10: { title: "Крепкая дружба", text: "10 дней вместе — Котость уже считает вас своим человеком. Она ждёт вас у двери каждый вечер.",                   color: "#06b6d4", icon: "🤝", rarity: "Редкая",   days: 10 },
  days15: { title: "Навсегда вместе",text: "15 дней! Котость полностью счастлива. Вы стали для неё самым важным существом в мире. Это настоящая любовь.",    color: "#f59e0b", icon: "💛", rarity: "Легендарная", days: 15 },
};

const DAY_DURATION_MS = 5 * 60 * 1000; // 5 минут = 1 день

// ─── STAT DECAY (per second) ─────────────────────────────────────────────────
const DECAY = { hunger: 0.05, cleanliness: 0.025, energy: 0.02, mood: 0.015 };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function clamp(v: number) { return Math.max(0, Math.min(100, v)); }

// ─── FLOATING BG ─────────────────────────────────────────────────────────────

function FloatingBg() {
  const [emojis] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      emoji: CAT_EMOJIS[i % CAT_EMOJIS.length],
      x: Math.random() * 100,
      duration: 14 + Math.random() * 20,
      delay: Math.random() * 18,
      size: 2.2 + Math.random() * 2.8,
    }))
  );
  return (
    <div className="bg-layer">
      {emojis.map((e) => (
        <div key={e.id} className="floating-emoji"
          style={{ left: `${e.x}%`, animationDuration: `${e.duration}s`, animationDelay: `-${e.delay}s`, fontSize: `${e.size}rem` }}>
          {e.emoji}
        </div>
      ))}
    </div>
  );
}

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

// ─── DAY TRANSITION SCREEN ────────────────────────────────────────────────────

function DayTransition({ from, to, onDone }: { from: number; to: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="day-transition-overlay">
      <div className="day-transition-content">
        <div className="day-number-old">День {from}</div>
        <div className="day-arrow">↓</div>
        <div className="day-number-new">День {to}</div>
        <p className="day-sub">Котость засыпает...</p>
      </div>
    </div>
  );
}

// ─── CH1 MODAL ────────────────────────────────────────────────────────────────

function Ch1EndingModal({ ending, onClose }: { ending: Ch1Ending; onClose: () => void }) {
  const data = CH1_ENDINGS[ending];
  const isKing = ending === "king";
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box${isKing ? " modal-king" : ""}`}
        style={{ "--ending-color": data.color } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}>
        {isKing && <div className="king-sparkles">✨ ✨ ✨</div>}
        <div className="modal-icon">{data.icon}</div>
        <div className="modal-rarity" style={{ color: data.color }}>{data.rarity}</div>
        <h2 className="modal-title" style={{ color: data.color }}>{data.title}</h2>
        <p className="modal-text">{data.text}</p>
        <button className="btn-ghost" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

// ─── CH2 MODAL ────────────────────────────────────────────────────────────────

function Ch2EndingModal({ ending, onClose }: { ending: Ch2Ending; onClose: () => void }) {
  const data = CH2_ENDINGS[ending];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-king"
        style={{ "--ending-color": data.color } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}>
        <div className="king-sparkles">🎉 🎉 🎉</div>
        <div className="modal-icon">{data.icon}</div>
        <div className="modal-rarity" style={{ color: data.color }}>{data.rarity}</div>
        <h2 className="modal-title" style={{ color: data.color }}>{data.title}</h2>
        <p className="modal-text">{data.text}</p>
        <button className="btn-ghost" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────

function ConfirmModal({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box modal-shake modal-danger">
        <div className="modal-icon">🙀</div>
        <h2 className="modal-title" style={{ color: "#ef4444" }}>Вы точно не хотите забирать Котость домой?</h2>
        <p className="modal-text" style={{ color: "#fca5a5" }}>Она смотрит на вас своими большими глазами...</p>
        <div className="modal-actions">
          <button className="btn-danger" onClick={onYes}>Да, не хочу</button>
          <button className="btn-primary" onClick={onNo}>Нет, заберу её!</button>
        </div>
      </div>
    </div>
  );
}

// ─── CAT RAN AWAY MODAL ───────────────────────────────────────────────────────

function CatRanAwayModal({ reason, onClose }: { reason: string; onClose: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box modal-danger">
        <div className="modal-icon">😿</div>
        <h2 className="modal-title" style={{ color: "#ef4444" }}>Котость ушла...</h2>
        <p className="modal-text" style={{ color: "#fca5a5" }}>{reason} Она грустно убежала, а дни сбросились.</p>
        <button className="btn-ghost" onClick={onClose}>Попробовать снова</button>
      </div>
    </div>
  );
}

// ─── CHAPTER 1 ────────────────────────────────────────────────────────────────

function Chapter1({ obtained, setObtained }: {
  obtained: Set<Ch1Ending>;
  setObtained: React.Dispatch<React.SetStateAction<Set<Ch1Ending>>>;
}) {
  const [activeEnding, setActiveEnding] = useState<Ch1Ending | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingKing, setPendingKing] = useState(false);

  const allMainObtained = obtained.has("good") && obtained.has("bad");
  const allFourObtained = (s: Set<Ch1Ending>) => s.has("good") && s.has("bad") && s.has("terrible") && s.has("mercy");

  const triggerKingAfterDelay = useCallback((newSet: Set<Ch1Ending>) => {
    if (allFourObtained(newSet) && !newSet.has("king")) {
      setPendingKing(true);
      setTimeout(() => {
        setObtained((o) => new Set([...o, "king"]));
        setActiveEnding("king");
        setPendingKing(false);
      }, 3000);
    }
  }, [setObtained]);

  const handleYes = () => {
    setObtained((old) => new Set([...old, "good"]));
    setActiveEnding("good");
  };

  const handleNo = () => {
    if (allMainObtained) { setShowConfirm(true); }
    else { setObtained((old) => new Set([...old, "bad"])); setActiveEnding("bad"); }
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    setObtained((old) => {
      const next = new Set([...old, "terrible" as Ch1Ending]);
      triggerKingAfterDelay(next);
      return next;
    });
    setActiveEnding("terrible");
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    setObtained((old) => {
      const next = new Set([...old, "mercy" as Ch1Ending]);
      triggerKingAfterDelay(next);
      return next;
    });
    setActiveEnding("mercy");
  };

  const totalCh1 = Object.keys(CH1_ENDINGS).length;
  const progress = Math.round((obtained.size / totalCh1) * 100);

  return (
    <>
      <div className="scene-wrapper">
        <div className="scene-card">
          <div className="cat-big">🐱</div>
          <h1 className="scene-title">Забрать Котость домой</h1>
          <p className="scene-desc">Ты встретил маленькую Котость на улице. Она смотрит на тебя грустными глазами и мяукает. Что ты сделаешь?</p>
          <div className="choice-btns">
            <button className="btn-yes" onClick={handleYes} disabled={pendingKing}>✅ Да</button>
            <button className="btn-no" onClick={handleNo} disabled={pendingKing}>❌ Нет</button>
          </div>
          {pendingKing && <p className="pending-king-hint">✨ Что-то происходит...</p>}
          {obtained.size > 0 && (
            <div className="progress-bar-wrap">
              <div className="progress-label">Концовок Главы 1: {obtained.size}/{totalCh1}</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
        </div>
      </div>

      {showConfirm && <ConfirmModal onYes={handleConfirmYes} onNo={handleConfirmNo} />}
      {activeEnding && <Ch1EndingModal ending={activeEnding} onClose={() => setActiveEnding(null)} />}
    </>
  );
}

// ─── CHAPTER 2 ────────────────────────────────────────────────────────────────

function Chapter2({ ch2Obtained, setCh2Obtained }: {
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
  const [gameActive, setGameActive] = useState(true);

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

  const feed = () => setStats((s) => ({ ...s, hunger: clamp(s.hunger + 30), mood: clamp(s.mood + 5) }));
  const wash = () => setStats((s) => ({ ...s, cleanliness: clamp(s.cleanliness + 35) }));
  const sleep = () => setStats((s) => ({ ...s, energy: clamp(s.energy + 40), mood: clamp(s.mood + 10) }));
  const play = () => setStats((s) => ({ ...s, mood: clamp(s.mood + 25), energy: clamp(s.energy - 10) }));

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
          <StatBar label="Голод"     value={stats.hunger}      icon="🍖" color="#f97316" />
          <StatBar label="Чистота"   value={stats.cleanliness} icon="🛁" color="#06b6d4" />
          <StatBar label="Энергия"   value={stats.energy}      icon="⚡" color="#eab308" />
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

// ─── ENDINGS TAB ─────────────────────────────────────────────────────────────

function EndingsTab({ ch1Obtained, ch2Obtained }: { ch1Obtained: Set<Ch1Ending>; ch2Obtained: Set<Ch2Ending> }) {
  const totalCh1 = Object.keys(CH1_ENDINGS).length;
  const [activeModal, setActiveModal] = useState<{ type: "ch1" | "ch2"; key: string } | null>(null);

  return (
    <div className="endings-wrapper">
      <h2 className="section-title">📖 Концовки</h2>

      <div className="endings-chapter-label">— Глава 1 —</div>
      <div className="endings-grid">
        {(Object.keys(CH1_ENDINGS) as Ch1Ending[]).map((key) => {
          const data = CH1_ENDINGS[key];
          const got = ch1Obtained.has(key);
          return (
            <div key={key}
              className={`ending-card${got ? " ending-obtained" : " ending-locked"}${key === "king" ? " ending-king" : ""}`}
              style={got ? ({ "--ending-color": data.color } as React.CSSProperties) : {}}
              onClick={() => got && setActiveModal({ type: "ch1", key })}>
              <div className="ending-icon">{got ? data.icon : "🔒"}</div>
              <div className="ending-info">
                <div className="ending-rarity" style={{ color: got ? data.color : "#6b7280" }}>{data.rarity}</div>
                <div className="ending-name">{got ? data.title : "???"}</div>
              </div>
              {got && <div className="ending-tick">✓</div>}
            </div>
          );
        })}
      </div>

      <div className="endings-progress" style={{ marginBottom: "1.5rem" }}>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(ch1Obtained.size / totalCh1 * 100)}%` }} /></div>
        <div className="progress-label">{ch1Obtained.size} из {totalCh1}</div>
      </div>

      <div className="endings-chapter-label">— Глава 2 —</div>
      <div className="endings-grid">
        {(Object.keys(CH2_ENDINGS) as Ch2Ending[]).map((key) => {
          const data = CH2_ENDINGS[key];
          const got = ch2Obtained.has(key);
          return (
            <div key={key}
              className={`ending-card${got ? " ending-obtained" : " ending-locked"}`}
              style={got ? ({ "--ending-color": data.color } as React.CSSProperties) : {}}
              onClick={() => got && setActiveModal({ type: "ch2", key })}>
              <div className="ending-icon">{got ? data.icon : "🔒"}</div>
              <div className="ending-info">
                <div className="ending-rarity" style={{ color: got ? data.color : "#6b7280" }}>{data.rarity}</div>
                <div className="ending-name">{got ? data.title : `??? (${data.days} дней)`}</div>
              </div>
              {got && <div className="ending-tick">✓</div>}
            </div>
          );
        })}
      </div>

      <div className="endings-progress">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(ch2Obtained.size / 3 * 100)}%`, background: "linear-gradient(90deg,#22c55e,#06b6d4)" }} /></div>
        <div className="progress-label">{ch2Obtained.size} из 3</div>
      </div>

      {activeModal?.type === "ch1" && <Ch1EndingModal ending={activeModal.key as Ch1Ending} onClose={() => setActiveModal(null)} />}
      {activeModal?.type === "ch2" && <Ch2EndingModal ending={activeModal.key as Ch2Ending} onClose={() => setActiveModal(null)} />}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────

function SettingsTab({ theme, setTheme, ch1Complete, sendingEmail, onSaveEmail }:
  { theme: Theme; setTheme: (t: Theme) => void; ch1Complete: boolean; sendingEmail: boolean; onSaveEmail: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const [customBg, setCustomBg] = useState("#1a0a2e");
  const [customAccent, setCustomAccent] = useState("#f97316");

  const handleSave = () => {
    if (!email.includes("@")) return;
    onSaveEmail(email);
    setEmailSaved(true);
  };

  return (
    <div className="settings-wrapper">
      <h2 className="section-title">⚙️ Настройки</h2>

      <div className="settings-section">
        <div className="settings-label">🎨 Тема</div>
        <div className="theme-grid">
          {(["dark", "light"] as Theme[]).map((t) => (
            <button key={t} className={`theme-btn${theme === t ? " theme-active" : ""}`} onClick={() => setTheme(t)}>
              <span className="theme-preview" style={{ background: t === "dark" ? "#0a0a0a" : "#f8f5f0", border: "2px solid", borderColor: t === "dark" ? "#f97316" : "#d97706" }} />
              <span>{t === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}</span>
            </button>
          ))}
          <button
            className={`theme-btn${theme === "custom" ? " theme-active" : ""}${!ch1Complete ? " theme-locked" : ""}`}
            onClick={() => ch1Complete && setTheme("custom")}
            title={ch1Complete ? "" : "Пройди Главу 1 полностью"}>
            <span className="theme-preview" style={{ background: "linear-gradient(135deg, #1a0a2e, #f97316)" }} />
            <span>{ch1Complete ? "🎨 Своя тема" : "🔒 Своя тема"}</span>
            {!ch1Complete && <span className="theme-lock-hint">Пройди Главу 1</span>}
          </button>
        </div>

        {theme === "custom" && ch1Complete && (
          <div className="custom-theme-row">
            <label className="color-pick-label">
              Фон
              <input type="color" value={customBg} onChange={(e) => { setCustomBg(e.target.value); document.documentElement.style.setProperty("--custom-bg", e.target.value); }} />
            </label>
            <label className="color-pick-label">
              Акцент
              <input type="color" value={customAccent} onChange={(e) => { setCustomAccent(e.target.value); document.documentElement.style.setProperty("--custom-accent", e.target.value); }} />
            </label>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-label">📧 Email-уведомления <span className="optional-tag">по желанию</span></div>
        <p className="settings-hint">Получай письма о прохождении глав и открытии новых концовок.</p>
        {emailSaved ? (
          <div className="email-saved">✅ Email сохранён! Письмо отправлено.</div>
        ) : (
          <div className="email-row">
            <input className="email-input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primary" onClick={handleSave} disabled={sendingEmail || !email.includes("@")}>
              {sendingEmail ? "..." : "Сохранить"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [mainTab, setMainTab] = useState<MainTab>("ch1");
  const [subTab, setSubTab] = useState<"play" | "endings" | "guide" | "hero">("play");
  const [ch1Obtained, setCh1Obtained] = useState<Set<Ch1Ending>>(new Set());
  const [ch2Obtained, setCh2Obtained] = useState<Set<Ch2Ending>>(new Set());
  const [theme, setTheme] = useState<Theme>("dark");
  const [sendingEmail, setSendingEmail] = useState(false);

  const { sendEmail } = useUnisender({ apiUrl: UNISENDER_URL });

  const ch1Complete = ch1Obtained.has("king");

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--game-bg",     "#f8f5f0");
      root.style.setProperty("--game-fg",     "#1a1a1a");
      root.style.setProperty("--card-bg",     "rgba(255,255,255,0.92)");
      root.style.setProperty("--card-border", "rgba(0,0,0,0.1)");
      root.style.setProperty("--muted",       "#6b7280");
    } else if (theme === "custom") {
      const bg = getComputedStyle(root).getPropertyValue("--custom-bg") || "#1a0a2e";
      root.style.setProperty("--game-bg",     bg);
      root.style.setProperty("--game-fg",     "#f5f5f5");
      root.style.setProperty("--card-bg",     "rgba(30,10,50,0.92)");
      root.style.setProperty("--card-border", "rgba(249,115,22,0.2)");
      root.style.setProperty("--muted",       "#9ca3af");
    } else {
      root.style.setProperty("--game-bg",     "#0a0a0a");
      root.style.setProperty("--game-fg",     "#f5f5f5");
      root.style.setProperty("--card-bg",     "rgba(20,20,20,0.92)");
      root.style.setProperty("--card-border", "rgba(249,115,22,0.2)");
      root.style.setProperty("--muted",       "#9ca3af");
    }
  }, [theme]);

  const handleSaveEmail = async (email: string) => {
    setSendingEmail(true);
    try {
      await sendEmail({
        to_email: email,
        subject: "Добро пожаловать в мир Котости!",
        body_html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0a0a0a;color:#f5f5f5;border-radius:16px">
          <h1 style="color:#f97316">🐱 Котость — Глава 1</h1>
          <p>Спасибо, что подключили электронную почту!</p>
          ${ch1Complete ? `<p>🎉 Поздравляем! Вы прошли <b>Главу 1</b> полностью и открыли <b>Главу 2</b>!</p>
          <p>Котость рада видеть вас снова в новой главе 😸</p>` : ""}
          <p style="color:#6b7280;font-size:0.85rem;margin-top:24px">Котость Глава 1 · poehali.dev</p>
        </div>`,
        tags: ["kotost", "welcome"],
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const navItems: { id: MainTab; label: string; badge?: number }[] = [
    { id: "ch1",      label: "Глава 1" },
    { id: "ch2",      label: "Глава 2", badge: ch1Complete ? undefined : undefined },
    { id: "ch3",      label: "Глава 3" },
    { id: "settings", label: "⚙️ Настройки" },
  ];

  const subItems: { id: typeof subTab; label: string }[] = [
    { id: "play",    label: mainTab === "ch1" ? "Играть" : "Играть" },
    { id: "endings", label: "Концовки" },
    { id: "guide",   label: "Гайд" },
    { id: "hero",    label: "Котость" },
  ];

  return (
    <div className="game-root">
      <FloatingBg />

      {/* ─ TOP NAV ─ */}
      <header className="game-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-cat">🐱</span>
            <span className="logo-title">Котость</span>
          </div>
          <nav className="game-nav">
            {navItems.map(({ id, label }) => (
              <button key={id}
                className={`nav-btn${mainTab === id ? " nav-active" : ""}${id === "ch2" && !ch1Complete ? " nav-locked" : ""}${id === "ch3" ? " nav-locked" : ""}`}
                onClick={() => {
                  if (id === "ch3") return;
                  if (id === "ch2" && !ch1Complete) return;
                  setMainTab(id);
                }}>
                {id === "ch2" && !ch1Complete ? "🔒 Глава 2" : label}
                {id === "ch3" ? " 🔒" : ""}
              </button>
            ))}
          </nav>
        </div>
        {/* SUB NAV for ch1/ch2 */}
        {(mainTab === "ch1" || mainTab === "ch2") && (
          <div className="sub-nav-bar">
            <div className="sub-nav-inner">
              {subItems.map(({ id, label }) => (
                <button key={id}
                  className={`sub-nav-btn${subTab === id ? " sub-nav-active" : ""}`}
                  onClick={() => setSubTab(id)}>
                  {label}
                  {id === "endings" && (ch1Obtained.size + ch2Obtained.size) > 0 && (
                    <span className="nav-badge">{ch1Obtained.size + ch2Obtained.size}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="game-main">

        {/* ─ CH3 locked toast ─ */}
        {mainTab === "ch3" && (
          <div className="locked-chapter">
            <div className="locked-emoji">🔮</div>
            <h2 className="locked-title">Скоро в игре!</h2>
            <p className="locked-desc">Глава 3 находится в разработке. Следи за обновлениями!</p>
          </div>
        )}

        {/* ─ CH2 locked ─ */}
        {mainTab === "ch2" && !ch1Complete && (
          <div className="locked-chapter">
            <div className="locked-emoji">🔒</div>
            <h2 className="locked-title">Глава 2 заблокирована</h2>
            <p className="locked-desc">Получи все концовки Главы 1, чтобы открыть Главу 2.</p>
          </div>
        )}

        {/* ─ SETTINGS ─ */}
        {mainTab === "settings" && (
          <SettingsTab theme={theme} setTheme={setTheme} ch1Complete={ch1Complete}
            sendingEmail={sendingEmail} onSaveEmail={handleSaveEmail} />
        )}

        {/* ─ CH1 PLAY ─ */}
        {mainTab === "ch1" && subTab === "play" && (
          <Chapter1 obtained={ch1Obtained} setObtained={setCh1Obtained} />
        )}

        {/* ─ CH2 PLAY ─ */}
        {mainTab === "ch2" && ch1Complete && subTab === "play" && (
          <Chapter2 ch2Obtained={ch2Obtained} setCh2Obtained={setCh2Obtained} />
        )}

        {/* ─ ENDINGS ─ */}
        {(mainTab === "ch1" || mainTab === "ch2") && subTab === "endings" && (
          <EndingsTab ch1Obtained={ch1Obtained} ch2Obtained={ch2Obtained} />
        )}

        {/* ─ GUIDE ─ */}
        {(mainTab === "ch1" || mainTab === "ch2") && subTab === "guide" && (
          <div className="about-wrapper">
            <h2 className="section-title">🗺️ Гайд по концовкам</h2>
            <div className="about-card">
              <div className="endings-chapter-label" style={{ marginBottom: "0.75rem" }}>Глава 1</div>
              {[
                ["1", "Хорошая концовка", `Нажми`, "Да", false],
                ["2", "Плохая концовка", `Нажми`, "Нет", false],
                ["3", "Ужасная концовка", `Получи обе обычные, потом Нет → красное окно →`, "Да, не хочу", false],
                ["4", "Концовка Милосердия", `Получи обе обычные, потом Нет → красное окно →`, "Нет, заберу!", false],
                ["👑", "Король Котостей", "Получи все 4 концовки — легендарная откроется через 3 секунды автоматически!", "", true],
              ].map(([num, title, desc, tag, king]) => (
                <div key={String(num)} className={`about-item${king ? " king-hint" : ""}`}>
                  <span className="about-num" style={king ? { background: "#f59e0b", fontSize: "1rem" } : {}}>{num}</span>
                  <div><b>{title}</b> — {desc} {tag && <span className={tag === "Да" || tag === "Нет, заберу!" ? "tag-yes" : "tag-no"}>{tag}</span>}</div>
                </div>
              ))}
              <div className="endings-chapter-label" style={{ margin: "0.75rem 0" }}>Глава 2</div>
              {(Object.entries(CH2_ENDINGS) as [Ch2Ending, typeof CH2_ENDINGS[Ch2Ending]][]).map(([key, d]) => (
                <div key={key} className="about-item">
                  <span className="about-num" style={{ background: d.color, color: "#fff" }}>{d.icon}</span>
                  <div><b>{d.title}</b> — проживи {d.days} дней с Котостью, не давая ей уйти</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─ HERO ─ */}
        {(mainTab === "ch1" || mainTab === "ch2") && subTab === "hero" && (
          <div className="hero-wrapper">
            <h2 className="section-title">🐾 Персонаж</h2>
            <div className="hero-card">
              <div className="hero-emoji">😺</div>
              <h3 className="hero-name">Котость</h3>
              <div className="hero-badge">Главный герой · Главы 1–2</div>
              <div className="hero-stats">
                {[["Милота", "99%", "#f97316"], ["Грусть", "80%", "#6b7280"], ["Мемность", "100%", "#f97316"]].map(([label, pct, col]) => (
                  <div key={label} className="stat">
                    <span className="stat-label">{label}</span>
                    <div className="stat-bar"><div className="stat-fill" style={{ width: pct, background: col === "#6b7280" ? col : undefined }} /></div>
                  </div>
                ))}
              </div>
              <p className="hero-desc">Котость — легендарный интернет-мем. Маленькая, грустная и очень хочет домой. Судьба этой кошечки в твоих руках!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
