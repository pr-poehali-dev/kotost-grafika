import { useState, useRef, useEffect } from "react";
import { CH1_ENDINGS, CH2_ENDINGS, CH3_ENDINGS } from "./gameTypes";
import type { Ch1Ending, Ch2Ending, Ch3Ending, Theme } from "./gameTypes";
import { Ch1EndingModal, Ch2EndingModal } from "./GameModals";

// ─── ENDINGS TAB ──────────────────────────────────────────────────────────────

export function EndingsTab({
  ch1Obtained, ch2Obtained, ch3Obtained,
}: {
  ch1Obtained: Set<Ch1Ending>;
  ch2Obtained: Set<Ch2Ending>;
  ch3Obtained: Set<Ch3Ending>;
}) {
  const totalCh1 = Object.keys(CH1_ENDINGS).length;
  const totalCh2 = Object.keys(CH2_ENDINGS).length;
  const totalCh3 = Object.keys(CH3_ENDINGS).length;
  const [activeModal, setActiveModal] = useState<{ type: "ch1" | "ch2"; key: string } | null>(null);

  return (
    <div className="endings-wrapper">
      <h2 className="section-title">📖 Концовки</h2>

      {/* Глава 1 */}
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

      {/* Глава 2 */}
      <div className="endings-chapter-label">— Глава 2 —</div>
      <div className="endings-grid">
        {(Object.keys(CH2_ENDINGS) as Ch2Ending[]).map((key) => {
          const data = CH2_ENDINGS[key];
          const got = ch2Obtained.has(key);
          return (
            <div key={key}
              className={`ending-card${got ? " ending-obtained" : " ending-locked"}${key === "master2" ? " ending-king" : ""}`}
              style={got ? ({ "--ending-color": data.color } as React.CSSProperties) : {}}
              onClick={() => got && setActiveModal({ type: "ch2", key })}>
              <div className="ending-icon">{got ? data.icon : "🔒"}</div>
              <div className="ending-info">
                <div className="ending-rarity" style={{ color: got ? data.color : "#6b7280" }}>{data.rarity}</div>
                <div className="ending-name">{got ? data.title : key === "master2" ? "??? (Мастер)" : `??? (${data.days} дней)`}</div>
              </div>
              {got && <div className="ending-tick">✓</div>}
            </div>
          );
        })}
      </div>
      <div className="endings-progress" style={{ marginBottom: "1.5rem" }}>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(ch2Obtained.size / totalCh2 * 100)}%`, background: "linear-gradient(90deg,#22c55e,#06b6d4)" }} /></div>
        <div className="progress-label">{ch2Obtained.size} из {totalCh2}</div>
      </div>

      {/* Глава 3 */}
      <div className="endings-chapter-label">— Глава 3 🧪 —</div>
      <div className="endings-grid">
        {(Object.keys(CH3_ENDINGS) as Ch3Ending[]).map((key) => {
          const data = CH3_ENDINGS[key];
          const got = ch3Obtained.has(key);
          return (
            <div key={key}
              className={`ending-card${got ? " ending-obtained" : " ending-locked"}${key === "master3" ? " ending-king" : ""}`}
              style={got ? ({ "--ending-color": data.color } as React.CSSProperties) : {}}>
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
      <div className="endings-progress">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(ch3Obtained.size / totalCh3 * 100)}%`, background: "linear-gradient(90deg,#f472b6,#8b5cf6)" }} /></div>
        <div className="progress-label">{ch3Obtained.size} из {totalCh3}</div>
      </div>

      {activeModal?.type === "ch1" && <Ch1EndingModal ending={activeModal.key as Ch1Ending} onClose={() => setActiveModal(null)} />}
      {activeModal?.type === "ch2" && <Ch2EndingModal ending={activeModal.key as Ch2Ending} onClose={() => setActiveModal(null)} />}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────

export function SettingsTab({ theme, setTheme, ch1Complete, musicOn, setMusicOn, musicVolume, setMusicVolume, unlockCode, allUnlocked, onUnlockAll }:
  {
    theme: Theme; setTheme: (t: Theme) => void; ch1Complete: boolean;
    musicOn: boolean; setMusicOn: (v: boolean) => void;
    musicVolume: number; setMusicVolume: (v: number) => void;
    unlockCode: string; allUnlocked: boolean; onUnlockAll: () => void;
  }) {
  const [customBg, setCustomBg] = useState("#1a0a2e");
  const [customAccent, setCustomAccent] = useState("#f97316");
  const [codeInput, setCodeInput] = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "ok" | "wrong">("idle");

  const handleCode = () => {
    if (codeInput.trim() === unlockCode) {
      setCodeStatus("ok");
      onUnlockAll();
    } else {
      setCodeStatus("wrong");
      setTimeout(() => setCodeStatus("idle"), 2000);
    }
    setCodeInput("");
  };

  return (
    <div className="settings-wrapper">
      <h2 className="section-title">⚙️ Настройки</h2>

      {/* Тема */}
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

      {/* Музыка */}
      <div className="settings-section">
        <div className="settings-label">🎵 Музыка</div>
        <div className="music-row">
          <button className={`music-toggle-btn${musicOn ? " music-on" : ""}`} onClick={() => setMusicOn(!musicOn)}>
            {musicOn ? "🔊 Включена" : "🔇 Выключена"}
          </button>
          {musicOn && (
            <div className="volume-row">
              <span className="volume-label">🔉</span>
              <input type="range" min={0} max={100} value={Math.round(musicVolume * 100)}
                onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                className="volume-slider" />
              <span className="volume-label">🔊</span>
              <span className="volume-val">{Math.round(musicVolume * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Gmail */}
      <div className="settings-section">
        <div className="settings-label">
          📧 Gmail-адрес <span className="optional-tag">по желанию</span>
        </div>
        <p className="settings-hint">Введи свой Gmail — в будущих обновлениях будут уведомления о прохождении.</p>
        <GmailInput />
      </div>

      {/* Код разблокировки */}
      <div className="settings-section">
        <div className="settings-label">🔓 Код разблокировки</div>
        <p className="settings-hint">Введи код, чтобы разблокировать все главы сразу.</p>
        {allUnlocked ? (
          <div className="email-saved">✅ Все главы разблокированы!</div>
        ) : (
          <div className="email-row">
            <input className="email-input" type="text" placeholder="Введи код..." maxLength={8}
              value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCode()}
              style={codeStatus === "wrong" ? { borderColor: "#ef4444" } : codeStatus === "ok" ? { borderColor: "#22c55e" } : {}} />
            <button className="btn-primary" onClick={handleCode} disabled={!codeInput}>
              Ввести
            </button>
          </div>
        )}
        {codeStatus === "wrong" && <p style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: "0.4rem" }}>Неверный код</p>}
        {codeStatus === "ok" && <p style={{ color: "#22c55e", fontSize: "0.82rem", marginTop: "0.4rem" }}>Готово! Все главы открыты 🎉</p>}
      </div>
    </div>
  );
}

function GmailInput() {
  const [email, setEmail] = useState(() => localStorage.getItem("kotost_gmail") || "");
  const [saved, setSaved] = useState(!!localStorage.getItem("kotost_gmail"));

  const handleSave = () => {
    if (!email.toLowerCase().endsWith("@gmail.com")) return;
    localStorage.setItem("kotost_gmail", email);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="gmail-saved-row">
        <span className="email-saved">✅ {email}</span>
        <button className="btn-ghost" style={{ padding: "0.35rem 0.9rem", fontSize: "0.82rem" }} onClick={() => setSaved(false)}>Изменить</button>
      </div>
    );
  }

  return (
    <div className="email-row">
      <input className="email-input" type="email" placeholder="yourname@gmail.com"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="btn-primary" onClick={handleSave}
        disabled={!email.toLowerCase().endsWith("@gmail.com")}>
        Сохранить
      </button>
    </div>
  );
}

// ─── NEWS TAB ─────────────────────────────────────────────────────────────────

const NEWS = [
  {
    date: "28 мая 2025",
    version: "v1.2.1",
    tag: "Бета-тест",
    tagColor: "#8b5cf6",
    title: "🧪 Бета-тест Главы 3 — Встреча",
    content: [
      "**Глава 3** теперь доступна в режиме бета-теста после получения концовки «Первые шаги» в Главе 2.",
      "Новый сюжет: вы снова встречаете Котость на улице после того, как не ухаживали за ней.",
      "Выбор с задержкой 10 секунд — обдумай своё решение.",
      "2 новые концовки: Милая 🌸 (погладить) и Жестокая 💢 (прогнать).",
      "Мастер-концовка 🔮 за получение обеих концовок Главы 3.",
      "Мастер Главы 2 🏆 — открывается при получении всех трёх концовок за дни.",
      "Длительность дня во Главе 2 сокращена до **2 минут 30 секунд**.",
      "В настройках добавлен **код разблокировки** — позволяет открыть все главы сразу.",
    ],
  },
  {
    date: "28 мая 2025",
    version: "v1.2",
    tag: "Обновление",
    tagColor: "#06b6d4",
    title: "🐾 Глава 2 — Уход за Котостью",
    content: [
      "Добавлена **Глава 2** — полноценный симулятор ухода за Котостью!",
      "Следи за 4 параметрами: голод, чистота, энергия, настроение.",
      "Параметры снижаются каждые 2 секунды на 1.5%.",
      "Если не следить — Котость уйдёт, и дни сбросятся.",
      "3 концовки: Первые шаги (5 дней), Крепкая дружба (10 дней), Навсегда вместе (15 дней).",
      "Настройки: темы, фоновая музыка с регулировкой громкости.",
      "Прогресс сохраняется автоматически каждые 5 секунд.",
    ],
  },
  {
    date: "20 мая 2025",
    version: "v1.1",
    tag: "Обновление",
    tagColor: "#a855f7",
    title: "🔒 Скрытые концовки и система вкладок",
    content: [
      "Добавлены 2 скрытые концовки: Ужасная и Милосердие.",
      "При получении всех 4 концовок — через 3 секунды открывается «Король Котостей».",
      "Вкладка «Концовки» с историей всех полученных концовок.",
      "Гайд по концовкам и раздел «Котость» с информацией о персонаже.",
    ],
  },
  {
    date: "15 мая 2025",
    version: "v1.0",
    tag: "Релиз",
    tagColor: "#f97316",
    title: "🚀 Котость — Глава 1. Релиз!",
    content: [
      "Первый выпуск игры «Котость» — интерактивная история про легендарного мема!",
      "**Основная механика:** встречаешь Котость на улице и решаешь её судьбу.",
      "2 базовые концовки: Хорошая (🏠 забрал домой) и Плохая (😿 оставил на улице).",
      "Плавающие эмодзи-коты на фоне, анимации, адаптация под мобильные.",
    ],
  },
];

export function NewsTab() {
  return (
    <div className="news-wrapper">
      <h2 className="section-title">📰 Новости</h2>
      <p className="section-sub">История обновлений игры Котость</p>
      <div className="news-list">
        {NEWS.map((item, i) => (
          <div key={i} className="news-card">
            <div className="news-header">
              <span className="news-tag" style={{ background: item.tagColor + "22", color: item.tagColor, border: `1px solid ${item.tagColor}44` }}>
                {item.tag} {item.version}
              </span>
              <span className="news-date">{item.date}</span>
            </div>
            <h3 className="news-title">{item.title}</h3>
            <ul className="news-list-items">
              {item.content.map((line, j) => (
                <li key={j} dangerouslySetInnerHTML={{
                  __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                }} />
              ))}
            </ul>
          </div>
        ))}
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
          ["👑", "Король Котостей", "Получи все 4 концовки — легендарная откроется через 3 секунды!", "", true],
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
            <div><b>{d.title}</b> — {key === "master2" ? "получи все 3 концовки за дни" : `проживи ${d.days} дней с Котостью, не давая ей уйти`}</div>
          </div>
        ))}

        <div className="endings-chapter-label" style={{ margin: "0.75rem 0" }}>Глава 3 🧪</div>
        {(Object.entries(CH3_ENDINGS) as [Ch3Ending, typeof CH3_ENDINGS[Ch3Ending]][]).map(([key, d]) => (
          <div key={key} className="about-item">
            <span className="about-num" style={{ background: d.color, color: "#fff" }}>{d.icon}</span>
            <div><b>{d.title}</b> — {key === "master3" ? "получи обе концовки Главы 3" : key === "gentle" ? "погладить и успокоить Котость" : "побить и выкинуть Котость"}</div>
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
        <div className="hero-badge">Главный герой · Главы 1–3</div>
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

// ─── BACKGROUND MUSIC ─────────────────────────────────────────────────────────

export function BackgroundMusic({ on, volume }: { on: boolean; volume: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = "https://cdn.pixabay.com/audio/2022/10/16/audio_a39e95a7b3.mp3";
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
    }

    if (on) {
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.then(() => { startedRef.current = true; }).catch(() => {
          // Автовоспроизведение заблокировано браузером — нужен клик пользователя
          const handler = () => {
            audioRef.current?.play().catch(() => {});
            document.removeEventListener("click", handler);
          };
          document.addEventListener("click", handler);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [on]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return null;
}
