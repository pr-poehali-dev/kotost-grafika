import { useState, useEffect } from "react";
import { useUnisender } from "@/components/extensions/unisender-go/useUnisender";
import type { Theme, Ch1Ending, Ch2Ending, MainTab, SubTab } from "./game/gameTypes";
import { FloatingBg, Chapter1 } from "./game/Chapter1";
import { Chapter2 } from "./game/Chapter2";
import { EndingsTab, SettingsTab, GuideTab, HeroTab } from "./game/GameTabs";

const UNISENDER_URL = "https://functions.poehali.dev/6b87f2ee-3635-45cb-8cd7-e0389c0354e9";

export default function Index() {
  const [mainTab, setMainTab] = useState<MainTab>("ch1");
  const [subTab, setSubTab] = useState<SubTab>("play");
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

  const navItems: { id: MainTab; label: string }[] = [
    { id: "ch1",      label: "Глава 1" },
    { id: "ch2",      label: "Глава 2" },
    { id: "ch3",      label: "Глава 3" },
    { id: "settings", label: "⚙️ Настройки" },
  ];

  const subItems: { id: SubTab; label: string }[] = [
    { id: "play",    label: "Играть" },
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

        {/* ─ CH3 locked ─ */}
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
          <GuideTab />
        )}

        {/* ─ HERO ─ */}
        {(mainTab === "ch1" || mainTab === "ch2") && subTab === "hero" && (
          <HeroTab />
        )}
      </main>
    </div>
  );
}
