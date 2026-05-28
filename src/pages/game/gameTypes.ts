// ─── TYPES ───────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "custom";
export type Ch1Ending = "good" | "bad" | "terrible" | "mercy" | "king";
export type Ch2Ending = "days5" | "days10" | "days15";
export type MainTab = "ch1" | "ch2" | "ch3" | "settings";
export type SubTab = "play" | "endings" | "guide" | "hero";

export const CAT_EMOJIS = ["😺","😸","😹","😻","😼","😽","🐱","🙀","😿","😾","🐈","🐾","💛","🧡","🫶","✨","💫","🌟","🐈‍⬛","❤️"];

// ─── CH1 DATA ─────────────────────────────────────────────────────────────────

export const CH1_ENDINGS: Record<Ch1Ending, { title: string; text: string; color: string; icon: string; rarity: string }> = {
  good:    { title: "Хорошая концовка",      text: "Вы забрали Котость домой, и она теперь живёт у вас. Поздравляем с хорошей концовкой.",                                               color: "#f97316", icon: "🏠", rarity: "Обычная"    },
  bad:     { title: "Плохая концовка",        text: "Котость осталась на улице, и вы ушли домой, не забрав её. Ей грустно.",                                                               color: "#6b7280", icon: "😿", rarity: "Обычная"    },
  terrible:{ title: "Ужасная концовка",       text: "Вы не забирали Котость домой, несмотря на то, что она так хотела. Ей очень грустно.",                                                color: "#dc2626", icon: "💔", rarity: "Скрытая"    },
  mercy:   { title: "Концовка Милосердия",    text: "Вы всё-таки забрали Котость домой из-за жалости. Теперь она живёт у вас.",                                                           color: "#7c3aed", icon: "💜", rarity: "Скрытая"    },
  king:    { title: "Король Котостей",        text: "Вы увидели все грани истории Котости. Она признаёт вас своим Королём. Все концовки получены — вы прошли Главу 1 полностью!",          color: "#f59e0b", icon: "👑", rarity: "Легендарная"},
};

// ─── CH2 DATA ─────────────────────────────────────────────────────────────────

export const CH2_ENDINGS: Record<Ch2Ending, { title: string; text: string; color: string; icon: string; rarity: string; days: number }> = {
  days5:  { title: "Первые шаги",    text: "Вы прожили 5 дней с Котостью! Она начинает вам доверять и мурчит по вечерам.",                                  color: "#22c55e", icon: "🌱", rarity: "Обычная",     days: 5  },
  days10: { title: "Крепкая дружба", text: "10 дней вместе — Котость уже считает вас своим человеком. Она ждёт вас у двери каждый вечер.",                   color: "#06b6d4", icon: "🤝", rarity: "Редкая",       days: 10 },
  days15: { title: "Навсегда вместе",text: "15 дней! Котость полностью счастлива. Вы стали для неё самым важным существом в мире. Это настоящая любовь.",    color: "#f59e0b", icon: "💛", rarity: "Легендарная", days: 15 },
};

export const DAY_DURATION_MS = 5 * 60 * 1000; // 5 минут = 1 день

export const DECAY = { hunger: 0.05, cleanliness: 0.025, energy: 0.02, mood: 0.015 };

export function clamp(v: number) { return Math.max(0, Math.min(100, v)); }
