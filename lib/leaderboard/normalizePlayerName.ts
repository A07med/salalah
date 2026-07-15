const REPEATED_WHITESPACE = /\s+/gu;
const ARABIC_TATWEEL = /\u0640/gu;

export const MAX_PLAYER_NAME_LENGTH = 20;

export interface NormalizedPlayerName {
  displayName: string;
  normalizedName: string;
}

export function normalizePlayerName(name: string): NormalizedPlayerName {
  const displayName = name
    .normalize("NFC")
    .trim()
    .replace(REPEATED_WHITESPACE, " ");

  const normalizedName = displayName
    .replace(ARABIC_TATWEEL, "")
    .toLocaleLowerCase("en-US");

  return { displayName, normalizedName };
}
