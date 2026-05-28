import { useEffect } from "react";
import { CH1_ENDINGS, CH2_ENDINGS } from "./gameTypes";
import type { Ch1Ending, Ch2Ending } from "./gameTypes";

// ─── CH1 MODAL ────────────────────────────────────────────────────────────────

export function Ch1EndingModal({ ending, onClose }: { ending: Ch1Ending; onClose: () => void }) {
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

export function Ch2EndingModal({ ending, onClose }: { ending: Ch2Ending; onClose: () => void }) {
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

export function ConfirmModal({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
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

export function CatRanAwayModal({ reason, onClose }: { reason: string; onClose: () => void }) {
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

// ─── DAY TRANSITION ───────────────────────────────────────────────────────────

export function DayTransition({ from, to, onDone }: { from: number; to: number; onDone: () => void }) {
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
