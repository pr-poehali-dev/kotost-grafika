import { useState, useEffect } from "react";
import { CH3_ENDINGS } from "./gameTypes";
import type { Ch3Ending } from "./gameTypes";

// ─── ГЛАВА 3 — БЕТА-ТЕСТ ─────────────────────────────────────────────────────

interface Chapter3Props {
  ch3Obtained: Set<Ch3Ending>;
  setCh3Obtained: React.Dispatch<React.SetStateAction<Set<Ch3Ending>>>;
}

type Phase = "intro" | "countdown" | "choice" | "ending";

export function Chapter3({ ch3Obtained, setCh3Obtained }: Chapter3Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(10);
  const [activeEnding, setActiveEnding] = useState<Ch3Ending | null>(null);
  const [masterShown, setMasterShown] = useState(false);

  // Обратный отсчёт перед выбором
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("choice");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const handleChoice = (ending: "gentle" | "cruel") => {
    const newSet = new Set([...ch3Obtained, ending]) as Set<Ch3Ending>;
    setCh3Obtained(newSet);
    setActiveEnding(ending);
    setPhase("ending");

    // Мастер-концовка если обе обычные получены
    const hasBoth = newSet.has("gentle") && newSet.has("cruel");
    if (hasBoth && !ch3Obtained.has("master3") && !masterShown) {
      setMasterShown(true);
      setTimeout(() => {
        setCh3Obtained((old) => new Set([...old, "master3"]));
        setActiveEnding("master3");
      }, 3500);
    }
  };

  const reset = () => {
    setPhase("intro");
    setCountdown(10);
    setActiveEnding(null);
  };

  return (
    <div className="ch3-wrapper">
      {/* БЕТА-БАННЕР */}
      <div className="beta-banner">
        <span className="beta-tag">🧪 Бета-тест</span>
        Глава 3 в раннем доступе — возможны изменения
      </div>

      {phase === "intro" && (
        <div className="ch3-card">
          <div className="ch3-scene-emoji">😿</div>
          <h2 className="ch3-title">Глава 3 — Встреча</h2>
          <p className="ch3-text">
            Прошло время. Вы идёте по улице и вдруг замечаете знакомый силуэт.
            <br /><br />
            Это <b>Котость</b>. Та самая — которую вы когда-то не захотели кормить и мыть.
            Она смотрит на вас. В её глазах — что-то между надеждой и обидой.
          </p>
          <button className="btn-primary ch3-start-btn" onClick={() => setPhase("countdown")}>
            Подойти ближе →
          </button>
          {ch3Obtained.size > 0 && (
            <div className="ch3-progress">
              Получено концовок: {ch3Obtained.size}/{Object.keys(CH3_ENDINGS).length}
            </div>
          )}
        </div>
      )}

      {phase === "countdown" && (
        <div className="ch3-card ch3-countdown-card">
          <div className="ch3-scene-emoji">🐱</div>
          <p className="ch3-text">Котость смотрит на вас. Вы подходите...</p>
          <div className="ch3-countdown-ring">
            <div className="ch3-countdown-num">{countdown}</div>
          </div>
          <p className="ch3-hint">Что вы сделаете?</p>
        </div>
      )}

      {phase === "choice" && (
        <div className="ch3-card">
          <div className="ch3-scene-emoji">🐱</div>
          <p className="ch3-text">
            Котость стоит перед вами. Она чуть дрожит. Вы чувствуете, что этот момент — важный.
          </p>
          <div className="ch3-choices">
            <button className="ch3-choice-btn ch3-choice-gentle" onClick={() => handleChoice("gentle")}>
              <span className="ch3-choice-icon">🤗</span>
              <span className="ch3-choice-label">Погладить и успокоить</span>
              <span className="ch3-choice-desc">Дать ей тепло и заботу</span>
            </button>
            <button className="ch3-choice-btn ch3-choice-cruel" onClick={() => handleChoice("cruel")}>
              <span className="ch3-choice-icon">💢</span>
              <span className="ch3-choice-label">Побить и выкинуть</span>
              <span className="ch3-choice-desc">Прогнать её прочь</span>
            </button>
          </div>
        </div>
      )}

      {phase === "ending" && activeEnding && (
        <EndingScreen ending={activeEnding} onReset={reset} />
      )}
    </div>
  );
}

// ─── ЭКРАН КОНЦОВКИ ───────────────────────────────────────────────────────────

function EndingScreen({ ending, onReset }: { ending: Ch3Ending; onReset: () => void }) {
  const data = CH3_ENDINGS[ending];
  const isMaster = ending === "master3";

  return (
    <div className={`ch3-ending-screen${isMaster ? " ch3-ending-master" : ""}`}
      style={{ "--ending-color": data.color } as React.CSSProperties}>
      {isMaster && <div className="king-sparkles">🔮 ✨ 🔮</div>}
      <div className="ch3-ending-icon">{data.icon}</div>
      <div className="ch3-ending-rarity" style={{ color: data.color }}>{data.rarity}</div>
      <h2 className="ch3-ending-title" style={{ color: data.color }}>{data.title}</h2>
      <p className="ch3-ending-text">{data.text}</p>
      <button className="btn-ghost" onClick={onReset}>Сыграть снова</button>
    </div>
  );
}
