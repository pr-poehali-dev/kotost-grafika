import { useState, useEffect } from "react";

type Ending = "good" | "bad" | "terrible" | "mercy" | "king";

const CAT_EMOJIS = ["😺", "😸", "😹", "😻", "😼", "😽", "🐱", "🙀", "😿", "😾", "🐈", "🐾", "💛", "🧡", "🫶", "✨", "💫", "🌟", "🐈‍⬛", "❤️"];

const ENDINGS_DATA: Record<Ending, { title: string; text: string; color: string; icon: string; rarity: string }> = {
  good: {
    title: "Хорошая концовка",
    text: "Вы забрали Котость домой, и она теперь живёт у вас. Поздравляем с хорошей концовкой.",
    color: "#f97316",
    icon: "🏠",
    rarity: "Обычная",
  },
  bad: {
    title: "Плохая концовка",
    text: "Вы получили плохую концовку. Котость осталась на улице, и вы ушли домой, не забрав её. Ей грустно.",
    color: "#6b7280",
    icon: "😿",
    rarity: "Обычная",
  },
  terrible: {
    title: "Ужасная концовка",
    text: "Вы не забирали Котость домой, несмотря на то, что она так хотела. Ей очень грустно.",
    color: "#dc2626",
    icon: "💔",
    rarity: "Скрытая",
  },
  mercy: {
    title: "Концовка Милосердия",
    text: "Вы всё-таки забрали Котость домой из-за жалости. Теперь она живёт у вас.",
    color: "#7c3aed",
    icon: "💜",
    rarity: "Скрытая",
  },
  king: {
    title: "Король Котостей",
    text: "Вы увидели все грани истории Котости. Она признаёт вас своим Королём. Все концовки получены — вы прошли Главу 1 полностью!",
    color: "#f59e0b",
    icon: "👑",
    rarity: "Легендарная",
  },
};

function EndingModal({
  ending,
  onClose,
  onReset,
}: {
  ending: Ending;
  onClose: () => void;
  onReset: () => void;
}) {
  const data = ENDINGS_DATA[ending];
  const isKing = ending === "king";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box${isKing ? " modal-king" : ""}`}
        style={{ "--ending-color": data.color } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {isKing && <div className="king-sparkles">✨ ✨ ✨</div>}
        <div className="modal-icon">{data.icon}</div>
        <div className="modal-rarity" style={{ color: data.color }}>
          {data.rarity}
        </div>
        <h2 className="modal-title" style={{ color: data.color }}>
          {data.title}
        </h2>
        <p className="modal-text">{data.text}</p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onReset}>
            Играть снова
          </button>
          <button className="btn-ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  onYes,
  onNo,
}: {
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box modal-shake modal-danger">
        <div className="modal-icon">🙀</div>
        <h2 className="modal-title" style={{ color: "#ef4444" }}>
          Вы точно не хотите забирать Котость домой?
        </h2>
        <p className="modal-text" style={{ color: "#fca5a5" }}>
          Она смотрит на вас своими большими глазами...
        </p>
        <div className="modal-actions">
          <button className="btn-danger" onClick={onYes}>
            Да, не хочу
          </button>
          <button className="btn-primary" onClick={onNo}>
            Нет, заберу её!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [tab, setTab] = useState<"game" | "endings" | "about" | "hero">("game");
  const [obtained, setObtained] = useState<Set<Ending>>(new Set());
  const [activeEnding, setActiveEnding] = useState<Ending | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [floatingEmojis] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      emoji: CAT_EMOJIS[i % CAT_EMOJIS.length],
      x: Math.random() * 100,
      duration: 14 + Math.random() * 20,
      delay: Math.random() * 18,
      size: 2.2 + Math.random() * 2.8,
    }))
  );

  const addEnding = (ending: Ending, prev?: Set<Ending>) => {
    setObtained((old) => {
      const next = new Set([...old, ending]);
      return next;
    });
    return ending;
  };

  const allMainObtained = (set: Set<Ending>) =>
    set.has("good") && set.has("bad");

  const allFourObtained = (set: Set<Ending>) =>
    set.has("good") && set.has("bad") && set.has("terrible") && set.has("mercy");

  const handleYes = () => {
    setObtained((old) => new Set([...old, "good"]));
    setActiveEnding("good");
  };

  const handleNo = () => {
    if (allMainObtained(obtained)) {
      setShowConfirm(true);
    } else {
      setObtained((old) => new Set([...old, "bad"]));
      setActiveEnding("bad");
    }
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    setObtained((old) => {
      const next = new Set([...old, "terrible" as Ending]);
      if (allFourObtained(next)) {
        setTimeout(() => {
          setObtained((o2) => new Set([...o2, "king"]));
          setActiveEnding("king");
        }, 600);
      }
      return next;
    });
    setActiveEnding("terrible");
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    setObtained((old) => {
      const next = new Set([...old, "mercy" as Ending]);
      if (allFourObtained(next)) {
        setTimeout(() => {
          setObtained((o2) => new Set([...o2, "king"]));
          setActiveEnding("king");
        }, 600);
      }
      return next;
    });
    setActiveEnding("mercy");
  };

  const resetGame = () => {
    setActiveEnding(null);
    setShowConfirm(false);
  };

  const handleCloseModal = () => {
    setActiveEnding(null);
    setShowConfirm(false);
  };

  const totalEndings = Object.keys(ENDINGS_DATA).length;
  const progress = Math.round((obtained.size / totalEndings) * 100);

  return (
    <div className="game-root">
      <div className="bg-layer">
        {floatingEmojis.map((e) => (
          <div
            key={e.id}
            className="floating-emoji"
            style={{
              left: `${e.x}%`,
              animationDuration: `${e.duration}s`,
              animationDelay: `-${e.delay}s`,
              fontSize: `${e.size}rem`,
            }}
          >
            {e.emoji}
          </div>
        ))}
      </div>

      <header className="game-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-cat">🐱</span>
            <span className="logo-title">Котость</span>
            <span className="logo-chapter">Глава 1</span>
          </div>
          <nav className="game-nav">
            {(["game", "endings", "about", "hero"] as const).map((t) => (
              <button
                key={t}
                className={`nav-btn${tab === t ? " nav-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "game" && "Игра"}
                {t === "endings" && (
                  <>
                    Концовки
                    {obtained.size > 0 && (
                      <span className="nav-badge">{obtained.size}</span>
                    )}
                  </>
                )}
                {t === "about" && "Гайд"}
                {t === "hero" && "Котость"}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="game-main">
        {tab === "game" && (
          <div className="scene-wrapper">
            <div className="scene-card">
              <div className="cat-big">🐱</div>
              <h1 className="scene-title">Забрать Котость домой</h1>
              <p className="scene-desc">
                Ты встретил маленькую Котость на улице. Она смотрит на тебя
                грустными глазами и мяукает. Что ты сделаешь?
              </p>
              <div className="choice-btns">
                <button className="btn-yes" onClick={handleYes}>
                  ✅ Да
                </button>
                <button className="btn-no" onClick={handleNo}>
                  ❌ Нет
                </button>
              </div>
              {obtained.size > 0 && (
                <div className="progress-bar-wrap">
                  <div className="progress-label">
                    Концовок: {obtained.size}/{totalEndings}
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "endings" && (
          <div className="endings-wrapper">
            <h2 className="section-title">📖 Концовки</h2>
            <p className="section-sub">
              Собери все концовки, чтобы открыть легендарную!
            </p>
            <div className="endings-grid">
              {(Object.keys(ENDINGS_DATA) as Ending[]).map((key) => {
                const data = ENDINGS_DATA[key];
                const isObtained = obtained.has(key);
                return (
                  <div
                    key={key}
                    className={`ending-card${isObtained ? " ending-obtained" : " ending-locked"}${key === "king" ? " ending-king" : ""}`}
                    style={isObtained ? ({ "--ending-color": data.color } as React.CSSProperties) : {}}
                    onClick={() => isObtained && setActiveEnding(key)}
                  >
                    <div className="ending-icon">
                      {isObtained ? data.icon : "🔒"}
                    </div>
                    <div className="ending-info">
                      <div
                        className="ending-rarity"
                        style={{ color: isObtained ? data.color : "#6b7280" }}
                      >
                        {data.rarity}
                      </div>
                      <div className="ending-name">
                        {isObtained ? data.title : "???"}
                      </div>
                    </div>
                    {isObtained && <div className="ending-tick">✓</div>}
                  </div>
                );
              })}
            </div>
            <div className="endings-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-label">
                {obtained.size} из {totalEndings} концовок
              </div>
            </div>
          </div>
        )}

        {tab === "about" && (
          <div className="about-wrapper">
            <h2 className="section-title">🗺️ Как получить все концовки</h2>
            <div className="about-card">
              <div className="about-item">
                <span className="about-num">1</span>
                <div>
                  <b>Хорошая концовка</b> — нажми{" "}
                  <span className="tag-yes">Да</span> на главном экране
                </div>
              </div>
              <div className="about-item">
                <span className="about-num">2</span>
                <div>
                  <b>Плохая концовка</b> — нажми{" "}
                  <span className="tag-no">Нет</span> на главном экране
                </div>
              </div>
              <div className="about-item">
                <span className="about-num">3</span>
                <div>
                  <b>Ужасная концовка</b> — получи обе обычные концовки, потом
                  нажми Нет → в красном окне нажми{" "}
                  <span className="tag-no">Да, не хочу</span>
                </div>
              </div>
              <div className="about-item">
                <span className="about-num">4</span>
                <div>
                  <b>Концовка Милосердия</b> — получи обе обычные концовки,
                  потом нажми Нет → в красном окне нажми{" "}
                  <span className="tag-yes">Нет, заберу!</span>
                </div>
              </div>
              <div className="about-item king-hint">
                <span className="about-num" style={{ background: "#f59e0b" }}>
                  👑
                </span>
                <div>
                  <b>Король Котостей</b> — получи все 4 концовки. Легендарная
                  концовка откроется автоматически!
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "hero" && (
          <div className="hero-wrapper">
            <h2 className="section-title">🐾 Персонаж</h2>
            <div className="hero-card">
              <div className="hero-emoji">😺</div>
              <h3 className="hero-name">Котость</h3>
              <div className="hero-badge">Главный герой · Глава 1</div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-label">Милота</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: "99%" }} />
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-label">Грусть</span>
                  <div className="stat-bar">
                    <div
                      className="stat-fill"
                      style={{ width: "80%", background: "#6b7280" }}
                    />
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-label">Мемность</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
              <p className="hero-desc">
                Котость — легендарный интернет-мем. Она маленькая, грустная и
                очень хочет домой. Судьба этой кошечки в твоих руках. Выбирай
                мудро!
              </p>
            </div>
          </div>
        )}
      </main>

      {showConfirm && (
        <ConfirmModal onYes={handleConfirmYes} onNo={handleConfirmNo} />
      )}

      {activeEnding && (
        <EndingModal
          ending={activeEnding}
          onClose={handleCloseModal}
          onReset={resetGame}
        />
      )}
    </div>
  );
}
