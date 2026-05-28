// ─── TYPES ───────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "custom";
export type Ch1Ending = "good" | "bad" | "terrible" | "mercy" | "king";
export type Ch2Ending = "days5" | "days10" | "days15" | "master2";
export type Ch3Ending = "gentle" | "cruel" | "master3";
export type MainTab = "ch1" | "ch2" | "ch3" | "settings" | "news";
export type SubTab = "play" | "endings" | "guide" | "hero";

export interface Ch2State {
  day: number;
  stats: { hunger: number; cleanliness: number; energy: number; mood: number };
  dayProgress: number;
  showTransition: boolean;
  transitionFrom: number;
  catRanAway: string | null;
  activeEnding: Ch2Ending | null;
  dayStartTs: number;
}

export const INITIAL_CH2_STATE: Ch2State = {
  day: 1,
  stats: { hunger: 80, cleanliness: 80, energy: 80, mood: 80 },
  dayProgress: 0,
  showTransition: false,
  transitionFrom: 1,
  catRanAway: null,
  activeEnding: null,
  dayStartTs: Date.now(),
};

export const CAT_EMOJIS = ["😺","😸","😹","😻","😼","😽","🐱","🙀","😿","😾","🐈","🐾","💛","🧡","🫶","✨","💫","🌟","🐈‍⬛","❤️"];

// ─── CH1 DATA ─────────────────────────────────────────────────────────────────

export const CH1_ENDINGS: Record<Ch1Ending, { title: string; text: string; color: string; icon: string; rarity: string }> = {
  good:    { title: "Хорошая концовка",   text: "Вы забрали Котость домой, и она теперь живёт у вас. Поздравляем с хорошей концовкой.",                                               color: "#f97316", icon: "🏠", rarity: "Обычная"    },
  bad:     { title: "Плохая концовка",    text: "Котость осталась на улице, и вы ушли домой, не забрав её. Ей грустно.",                                                               color: "#6b7280", icon: "😿", rarity: "Обычная"    },
  terrible:{ title: "Ужасная концовка",   text: "Вы не забирали Котость домой, несмотря на то, что она так хотела. Ей очень грустно.",                                                color: "#dc2626", icon: "💔", rarity: "Скрытая"    },
  mercy:   { title: "Концовка Милосердия",text: "Вы всё-таки забрали Котость домой из-за жалости. Теперь она живёт у вас.",                                                           color: "#7c3aed", icon: "💜", rarity: "Скрытая"    },
  king:    { title: "Король Котостей",    text: "Вы увидели все грани истории Котости. Она признаёт вас своим Королём. Все концовки получены — вы прошли Главу 1 полностью!",          color: "#f59e0b", icon: "👑", rarity: "Легендарная"},
};

// ─── CH2 DATA ─────────────────────────────────────────────────────────────────

export const CH2_ENDINGS: Record<Ch2Ending, { title: string; text: string; color: string; icon: string; rarity: string; days: number }> = {
  days5:  { title: "Первые шаги",    text: "Вы прожили 5 дней с Котостью! Она начинает вам доверять и мурчит по вечерам.",                                 color: "#22c55e", icon: "🌱", rarity: "Обычная",     days: 5  },
  days10: { title: "Крепкая дружба", text: "10 дней вместе — Котость уже считает вас своим человеком. Она ждёт вас у двери каждый вечер.",                  color: "#06b6d4", icon: "🤝", rarity: "Редкая",       days: 10 },
  days15: { title: "Навсегда вместе",text: "15 дней! Котость полностью счастлива. Вы стали для неё самым важным существом в мире. Это настоящая любовь.",   color: "#f59e0b", icon: "💛", rarity: "Легендарная", days: 15 },
  master2:{ title: "Мастер Главы 2", text: "Вы получили все концовки Второй Главы! Котость смотрит на вас с восхищением — вы настоящий мастер ухода.",     color: "#e879f9", icon: "🏆", rarity: "Мастер",       days: 0  },
};

// ─── CH3 DATA ─────────────────────────────────────────────────────────────────

export const CH3_ENDINGS: Record<Ch3Ending, { title: string; text: string; color: string; icon: string; rarity: string }> = {
  gentle: {
    title: "Милая концовка",
    text: "Вы погладили и успокоили Котость. Она замурчала, потёрлась о вашу ладонь и ушла в закат. Она рада — и вы тоже.",
    color: "#f472b6",
    icon: "🌸",
    rarity: "Добрая",
  },
  cruel: {
    title: "Жестокая концовка",
    text: "Вы побили Котость и выкинули её далеко. Ей очень грустно. Она больше не любит вас. Этот путь принесёт только пустоту.",
    color: "#dc2626",
    icon: "💢",
    rarity: "Жестокая",
  },
  master3: {
    title: "Мастер Главы 3",
    text: "Вы прошли все концовки Третьей Главы. Котость видела ваш выбор — и добрый, и жестокий. Теперь вы знаете цену своих решений.",
    color: "#8b5cf6",
    icon: "🔮",
    rarity: "Мастер",
  },
};

export const DAY_DURATION_MS = 150 * 1000;  // 2 минуты 30 секунд = 1 день
export const TICK_INTERVAL_MS = 2000;        // тик каждые 2 секунды
export const DECAY_PER_TICK = 1.5;           // -1.5% за тик

export function clamp(v: number) { return Math.max(0, Math.min(100, v)); }
