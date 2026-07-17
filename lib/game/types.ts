export type GameStatus = "idle" | "playing" | "runComplete";
export type RunPhase =
  | "ready"
  | "resolving-attempt"
  | "showing-result"
  | "run-complete";
export type AttemptIndex = 0 | 1 | 2;

export interface Point {
  x: number;
  y: number;
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

export interface GameState {
  status: GameStatus;
  phase: RunPhase;
  attemptIndex: AttemptIndex;
  attemptScores: number[];
  totalScore: number;
  successfulHits: number;
  mistakes: number;
  coconutScale: number;
  activeSlash: CutGesture | null;
  isDropping: boolean;
  lastFruitScore: number;
  lastQualityLabel: string;
  lastHitPoint: Point | null;
  lastSwipeAngle: number;
  mishliHitMarks: MishliHitMark[];
  cutFeedbackKey: number;
  bestScore: number;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "RESET_TO_IDLE" }
  | { type: "POINTER_DOWN"; point: Point }
  | { type: "POINTER_MOVE"; point: Point }
  | { type: "POINTER_CANCEL" }
  | {
      type: "POINTER_UP";
      point: Point;
      coconutRect: DOMRect | null;
      fruitBodyRect: DOMRect | null;
    }
  | { type: "ADVANCE_AFTER_FEEDBACK" }
  | { type: "DROP_COMPLETE" };
