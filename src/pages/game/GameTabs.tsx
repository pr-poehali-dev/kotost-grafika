import { useState } from "react";
import { CH1_ENDINGS, CH2_ENDINGS } from "./gameTypes";
import type { Ch1Ending, Ch2Ending, Theme } from "./gameTypes";
import { Ch1EndingModal, Ch2EndingModal } from "./GameModals";

// ─── ENDINGS TAB ─────────────────────────────────────────────────────────────

export function EndingsTab({ ch1Obtained, ch2Obtained }: { ch1Obtained: Set<Ch1Ending>; ch2Obtained: Set<Ch2Ending> }) {
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

export function SettingsTab({ theme, setTheme, ch1Complete, sendingEmail, onSaveEmail }:
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

// ─── GUIDE TAB ────────────────────────────────────────────────────────────────

export function GuideTab() {
  return (
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
  );
}

// ─── HERO TAB ─────────────────────────────────────────────────────────────────

export function HeroTab() {
  return (
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
  );
}
