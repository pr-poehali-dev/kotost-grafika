import { useState, useCallback } from "react";
import { CAT_EMOJIS, CH1_ENDINGS } from "./gameTypes";
import type { Ch1Ending } from "./gameTypes";
import { Ch1EndingModal, ConfirmModal } from "./GameModals";

// ─── FLOATING BG ─────────────────────────────────────────────────────────────

export function FloatingBg() {
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

// ─── CHAPTER 1 ────────────────────────────────────────────────────────────────

export function Chapter1({ obtained, setObtained }: {
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
