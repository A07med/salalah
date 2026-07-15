CREATE TABLE "mishli_game_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"player_name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"score" integer NOT NULL,
	"level_reached" integer DEFAULT 1 NOT NULL,
	"successful_hits" integer DEFAULT 0 NOT NULL,
	"mistakes" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mishli_game_scores_player_name_length" CHECK (char_length(btrim("mishli_game_scores"."player_name")) between 2 and 20),
	CONSTRAINT "mishli_game_scores_score_range" CHECK ("mishli_game_scores"."score" between 1 and 10000000),
	CONSTRAINT "mishli_game_scores_level_range" CHECK ("mishli_game_scores"."level_reached" between 1 and 1000),
	CONSTRAINT "mishli_game_scores_successful_hits_nonnegative" CHECK ("mishli_game_scores"."successful_hits" >= 0),
	CONSTRAINT "mishli_game_scores_mistakes_nonnegative" CHECK ("mishli_game_scores"."mistakes" >= 0),
	CONSTRAINT "mishli_game_scores_duration_nonnegative" CHECK ("mishli_game_scores"."duration_ms" >= 0)
);
--> statement-breakpoint
ALTER TABLE "mishli_game_scores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "mishli_game_scores_session_id_uidx" ON "mishli_game_scores" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "mishli_game_scores_normalized_name_idx" ON "mishli_game_scores" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "mishli_game_scores_leaderboard_idx" ON "mishli_game_scores" USING btree ("score" DESC NULLS LAST,"created_at");--> statement-breakpoint
REVOKE ALL ON TABLE "mishli_game_scores" FROM PUBLIC;--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
		EXECUTE 'REVOKE ALL ON TABLE "mishli_game_scores" FROM anon';
	END IF;
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
		EXECUTE 'REVOKE ALL ON TABLE "mishli_game_scores" FROM authenticated';
	END IF;
END
$$;