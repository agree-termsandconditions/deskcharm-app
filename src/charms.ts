export type Charm = {
  id: string;
  emoji: string;
  name: string;
};

export const DEFAULT_CHARMS: Charm[] = [
  { id: "nazar", emoji: "🧿", name: "Nazar Boncuğu" },
  { id: "hamsa", emoji: "🪬", name: "Hamsa" },
  { id: "clover", emoji: "🍀", name: "Four-Leaf Clover" },
  { id: "bell", emoji: "🔔", name: "Omamori Bell" },
];
