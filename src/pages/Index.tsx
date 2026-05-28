import { useState, useEffect, useCallback } from "react";
import type { Theme, Ch1Ending, Ch2Ending, Ch3Ending, MainTab, SubTab, Ch2State } from "./game/gameTypes";
import { INITIAL_CH2_STATE } from "./game/gameTypes";
import { FloatingBg, Chapter1 } from "./game/Chapter1";
import { Chapter2 } from "./game/Chapter2";
import { Chapter3 } from "./game/Chapter3";
import { EndingsTab, SettingsTab, GuideTab, HeroTab, NewsTab, BackgroundMusic } from "./game/GameTabs";

// ─── SAVE/LOAD ────────────────────────────────────────────────────────────────

const SAVE_KEY = "kotost_save_v3";
const UNLOCK_CODE = "5267";

interface SaveData {
  ch1Obtained: Ch1Ending[];
  ch2Obtained: Ch2Ending[];
  ch3Obtained: Ch3Ending[];
  ch2State: Ch2State;
  theme: Theme;
  musicOn: boolean;
  musicVolume: number;
  allUnlocked: boolean;
}

function loadSave(): Partial<SaveData> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_e) { return {}; }
}

function writeSave(data: SaveData) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (_e) { /* ignore */ }
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const saved = loadSave();

  const [mainTab, setMainTab] = useState<MainTab>("ch1");
  const [subTab, setSubTab] = useState<SubTab>("play");
  const [ch1Obtained, setCh1Obtained] = useState<Set<Ch1Ending>>(() => new Set(saved.ch1Obtained ?? []));
  const [ch2Obtained, setCh2Obtained] = useState<Set<Ch2Ending>>(() => new Set(saved.ch2Obtained ?? []));
  const [ch3Obtained, setCh3Obtained] = useState<Set<Ch3Ending>>(() => new Set(saved.ch3Obtained ?? []));
  const [ch2State, setCh2State] = useState<Ch2State>(() => ({
    ...(saved.ch2State ?? INITIAL_CH2_STATE),
    dayStartTs: Date.now(),
  }));
  const [theme, setTheme] = useState<Theme>(saved.theme ?? "dark");
  const [musicOn, setMusicOn] = useState(saved.musicOn ?? false);
  const [musicVolume, setMusicVolume] = useState(saved.musicVolume ?? 0.4);
  const [allUnlocked, setAllUnlocked] = useState(saved.allUnlocked ?? false);

  const ch1Complete = ch1Obtained.has("king") || allUnlocked;
  const ch3Unlocked = ch2Obtained.has("days5") || allUnlocked;

  // ─── МАСТЕР ГЛАВА 2: все 3 обычные концовки ──────────────────────────────
  useEffect(() => {
    const has3 = ch2Obtained.has("days5") && ch2Obtained.has("days10") && ch2Obtained.has("days15");
    if (has3 && !ch2Obtained.has("master2")) {
      setTimeout(() => {
        setCh2Obtained((old) => new Set([...old, "master2"]));
      }, 3000);
    }
  }, [ch2Obtained]);

  // ─── APPLY THEME ──────────────────────────────────────────────────────────
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

  // ─── AUTOSAVE каждые 5 секунд ─────────────────────────────────────────────
  const saveNow = useCallback(() => {
    writeSave({
      ch1Obtained: [...ch1Obtained] as Ch1Ending[],
      ch2Obtained: [...ch2Obtained] as Ch2Ending[],
      ch3Obtained: [...ch3Obtained] as Ch3Ending[],
      ch2State,
      theme,
      musicOn,
      musicVolume,
      allUnlocked,
    });
  }, [ch1Obtained, ch2Obtained, ch3Obtained, ch2State, theme, musicOn, musicVolume, allUnlocked]);

  useEffect(() => {
    const id = setInterval(saveNow, 5000);
    return () => clearInterval(id);
  }, [saveNow]);

  useEffect(() => {
    window.addEventListener("beforeunload", saveNow);
    return () => window.removeEventListener("beforeunload", saveNow);
  }, [saveNow]);

  // ─── NAV ──────────────────────────────────────────────────────────────────
  const navItems: { id: MainTab; label: string }[] = [
    { id: "ch1",      label: "Глава 1" },
    { id: "ch2",      label: "Глава 2" },
    { id: "ch3",      label: "Глава 3" },
    { id: "news",     label: "📰 Новости" },
    { id: "settings", label: "⚙️ Настройки" },
  ];

  const subItems: { id: SubTab; label: string }[] = [
    { id: "play",    label: "Играть" },
    { id: "endings", label: "Концовки" },
    { id: "guide",   label: "Гайд" },
    { id: "hero",    label: "Котость" },
  ];

  const totalEndings = ch1Obtained.size + ch2Obtained.size + ch3Obtained.size;

  return (
    <div className="game-root">
      <FloatingBg />
      <BackgroundMusic on={musicOn} volume={musicVolume} />

      {/* ─ TOP NAV ─ */}
      <header className="game-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-cat">🐱</span>
            <span className="logo-title">Котость</span>
          </div>
          <nav className="game-nav">
            {navItems.map(({ id, label }) => {
              const isCh2Locked = id === "ch2" && !ch1Complete;
              const isCh3Locked = id === "ch3" && !ch3Unlocked;
              return (
                <button key={id}
                  className={`nav-btn${mainTab === id ? " nav-active" : ""}${isCh2Locked || isCh3Locked ? " nav-locked" : ""}`}
                  onClick={() => {
                    if (isCh2Locked || isCh3Locked) return;
                    setMainTab(id);
                  }}>
                  {isCh2Locked ? "🔒 Глава 2" : isCh3Locked ? "🔒 Глава 3" : label}
                  {id === "ch3" && ch3Unlocked ? " 🧪" : ""}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SUB NAV для ch1/ch2 */}
        {(mainTab === "ch1" || mainTab === "ch2") && (
          <div className="sub-nav-bar">
            <div className="sub-nav-inner">
              {subItems.map(({ id, label }) => (
                <button key={id}
                  className={`sub-nav-btn${subTab === id ? " sub-nav-active" : ""}`}
                  onClick={() => setSubTab(id)}>
                  {label}
                  {id === "endings" && totalEndings > 0 && (
                    <span className="nav-badge">{totalEndings}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="game-main">

        {/* ─ CH2 locked ─ */}
        {mainTab === "ch2" && !ch1Complete && (
          <div className="locked-chapter">
            <div className="locked-emoji">🔒</div>
            <h2 className="locked-title">Глава 2 заблокирована</h2>
            <p className="locked-desc">Получи все концовки Главы 1, чтобы открыть Главу 2.</p>
          </div>
        )}

        {/* ─ CH3 locked ─ */}
        {mainTab === "ch3" && !ch3Unlocked && (
          <div className="locked-chapter">
            <div className="locked-emoji">🔮</div>
            <h2 className="locked-title">Глава 3 заблокирована</h2>
            <p className="locked-desc">Проживи <b>5 дней</b> с Котостью во Второй Главе, чтобы открыть Главу 3.</p>
          </div>
        )}

        {/* ─ SETTINGS ─ */}
        {mainTab === "settings" && (
          <SettingsTab
            theme={theme} setTheme={setTheme} ch1Complete={ch1Complete}
            musicOn={musicOn} setMusicOn={setMusicOn}
            musicVolume={musicVolume} setMusicVolume={setMusicVolume}
            unlockCode={UNLOCK_CODE}
            allUnlocked={allUnlocked}
            onUnlockAll={() => {
              setAllUnlocked(true);
              setCh1Obtained((old) => new Set([...old, "king"]));
            }}
          />
        )}

        {/* ─ NEWS ─ */}
        {mainTab === "news" && <NewsTab />}

        {/* ─ CH1 PLAY ─ */}
        {mainTab === "ch1" && subTab === "play" && (
          <Chapter1 obtained={ch1Obtained} setObtained={setCh1Obtained} />
        )}

        {/* ─ CH2 PLAY ─ */}
        {mainTab === "ch2" && ch1Complete && subTab === "play" && (
          <Chapter2
            ch2State={ch2State} setCh2State={setCh2State}
            ch2Obtained={ch2Obtained} setCh2Obtained={setCh2Obtained}
          />
        )}

        {/* ─ CH3 PLAY ─ */}
        {mainTab === "ch3" && ch3Unlocked && (
          <Chapter3 ch3Obtained={ch3Obtained} setCh3Obtained={setCh3Obtained} />
        )}

        {/* ─ ENDINGS ─ */}
        {(mainTab === "ch1" || mainTab === "ch2") && subTab === "endings" && (
          <EndingsTab ch1Obtained={ch1Obtained} ch2Obtained={ch2Obtained} ch3Obtained={ch3Obtained} />
        )}

        {/* ─ GUIDE ─ */}
        {(mainTab === "ch1" || mainTab === "ch2") && subTab === "guide" && <GuideTab />}

        {/* ─ HERO ─ */}
        {(mainTab === "ch1" || mainTab === "ch2") && subTab === "hero" && <HeroTab />}
      </main>
    </div>
  );
}
