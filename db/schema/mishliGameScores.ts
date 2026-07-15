import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const mishliGameScores = pgTable(
  "mishli_game_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull(),
    playerName: text("player_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    score: integer("score").notNull(),
    levelReached: integer("level_reached").notNull().default(1),
    successfulHits: integer("successful_hits").notNull().default(0),
    mistakes: integer("mistakes").notNull().default(0),
    durationMs: integer("duration_ms").notNull().default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("mishli_game_scores_session_id_uidx").on(table.sessionId),
    index("mishli_game_scores_normalized_name_idx").on(table.normalizedName),
    index("mishli_game_scores_leaderboard_idx").on(
      table.score.desc(),
      table.createdAt.asc(),
    ),
    check(
      "mishli_game_scores_player_name_length",
      sql`char_length(btrim(${table.playerName})) between 2 and 20`,
    ),
    check(
      "mishli_game_scores_score_range",
      sql`${table.score} between 1 and 10000000`,
    ),
    check(
      "mishli_game_scores_level_range",
      sql`${table.levelReached} between 1 and 1000`,
    ),
    check(
      "mishli_game_scores_successful_hits_nonnegative",
      sql`${table.successfulHits} >= 0`,
    ),
    check(
      "mishli_game_scores_mistakes_nonnegative",
      sql`${table.mistakes} >= 0`,
    ),
    check(
      "mishli_game_scores_duration_nonnegative",
      sql`${table.durationMs} >= 0`,
    ),
  ],
).enableRLS();

export type MishliGameScore = typeof mishliGameScores.$inferSelect;
export type NewMishliGameScore = typeof mishliGameScores.$inferInsert;
