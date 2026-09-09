export type RitualType = "ward" | "bless" | "sparkle" | "chime";

export type Charm = {
  id: string;
  emoji: string;
  name: string;
  ritual: RitualType;
};

export const DEFAULT_CHARMS: Charm[] = [
  { id: "nazar", emoji: "🧿", name: "Nazar Boncuğu", ritual: "ward" },
  { id: "hamsa", emoji: "🪬", name: "Hamsa", ritual: "bless" },
  { id: "clover", emoji: "🍀", name: "Four-Leaf Clover", ritual: "sparkle" },
  { id: "maneki-neko", emoji: "🐱", name: "Maneki-neko", ritual: "chime" },
  { id: "scarab", emoji: "🪲", name: "Scarab", ritual: "sparkle" },
  { id: "ganesha", emoji: "🐘", name: "Ganesha", ritual: "ward" },
  { id: "fu", emoji: "福", name: "Fu", ritual: "bless" },
];

export function ritualFor(charm: Charm): RitualType {
  return charm.ritual ?? "sparkle";
}
