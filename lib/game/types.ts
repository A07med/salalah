export type GameStatus = "idle" | "playing" | "levelComplete" | "gameOver";
export type CutQuality = "clean" | "edge" | "weak" | "miss";

export interface Point {
  x: number;
  y: number;
}

export interface SlashLine {
  id: string;
  start: Point;
  end: Point;
  createdAt: number;
}

export interface MishliHitMark {
  id: string;
  x: number;
  y: number;
  angle: number;
  strength: number;
}

export interface CutGesture {
  start: Point;
  end: Point;
}

export interface CutResult {
  hit: boolean;
  damage: number;
  score: number;
  impactPoint: Point | null;
  swipeAngle: number;
}

export interface DifficultyConfig {
  swingSpeed: number;
  swingAmplitude: number;
  coconutScale: number;
  damageMultiplier: number;
  maxMisses: number;
  windGusts: boolean;
}

export interface GameState {
  status: GameStatus;
  level: number;
  score: number;
  cutProgress: number;
  missCount: number;
  maxMisses: number;
  swingAmplitude: number;
  swingSpeed: number;
  coconutScale: number;
  slashLines: SlashLine[];
  activeSlash: CutGesture | null;
  isDropping: boolean;
  lastCutQuality: CutQuality | null;
  lastDamage: number;
  lastHitPoint: Point | null;
  lastSwipeAngle: number;
  mishliHitMarks: MishliHitMark[];
  cutFeedbackKey: number;
  bestScore: number;
  levelCompleteBonus: number;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "RESET_TO_IDLE" }
  | { type: "POINTER_DOWN"; point: Point }
  | { type: "POINTER_MOVE"; point: Point }
  | {
      type: "POINTER_UP";
      point: Point;
      coconutRect: DOMRect | null;
      fruitBodyRect: DOMRect | null;
    }
  | { type: "NEXT_LEVEL" }
  | { type: "CLEAR_SLASH_LINES" }
  | { type: "DROP_COMPLETE" };
