import { shopsyBridge } from "./shopsyBridge";
import { GAME_ID, GAME_NAME } from "../utils/config";
import { PlayerPrefs } from "../utils/PlayerPrefs";

/**
 * Level instrumentation (Shopsy level-based games, schema v1).
 *
 * Events (names are case-sensitive, same in every Shopsy level game):
 *   Level_Started    a level attempt begins
 *   Level_Completed  the attempt ends in a win
 *   Level_Failed     the attempt ends in a loss
 *   Level_Abandoned  the player leaves before a win or a loss
 *
 * Every attempt gets exactly one Level_Started and at most one outcome event,
 * joined by level_run_id. Started minus outcomes = attempts lost to an app kill.
 *
 * Per-user counters persist through the SDK player prefs (server side) under
 * one key, with a localStorage mirror for standalone browser runs.
 * "Today" is the IST calendar day, the same boundary the Shopsy economy uses.
 */

export const LEVEL_STATS_KEY = "level_stats_v1";
const LOCAL_MIRROR_KEY = `shopsy_${GAME_ID}_${LEVEL_STATS_KEY}`;
const SCHEMA_VERSION = 1;
const IST_OFFSET_MS = 330 * 60 * 1000;

type Extra = Record<string, unknown>;

interface LevelStats {
    day: string;              // IST yyyy-mm-dd the daily counters belong to
    playedToday: number;
    completedToday: number;
    playedTotal: number;
    completedTotal: number;
    attempts: Record<string, number>; // level -> lifetime attempts
    cleared: Record<string, number>;  // level -> lifetime wins
    maxCompleted: number;
}

interface LevelRun {
    runId: string;
    level: number;
    attempt: number;
    isReplay: boolean;
    startedAt: number;
    sessionIndex: number;
    ended: boolean;
}

export function istDay(nowMs: number = Date.now()): string {
    return new Date(nowMs + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function emptyStats(): LevelStats {
    return {
        day: istDay(), playedToday: 0, completedToday: 0, playedTotal: 0,
        completedTotal: 0, attempts: {}, cleared: {}, maxCompleted: 0
    };
}

export class LevelAnalytics {
    private static run: LevelRun | null = null;
    private static sessionLevels = 0;
    // The level the player is in (kept after the outcome so result-screen events still carry it).
    private static context: { level: number; runId: string } | null = null;

    /** Call when a level attempt begins (the level is on screen and playable). */
    static start(levelNumber: number, isReplay: boolean, extra: Extra = {}): void {
        if (this.run && !this.run.ended) {
            // A new attempt began without an outcome (restart, scene swap).
            this.abandon("restarted");
        }

        const stats = this.loadStats();
        const key = String(levelNumber);
        stats.attempts[key] = (stats.attempts[key] ?? 0) + 1;
        stats.playedToday += 1;
        stats.playedTotal += 1;
        this.sessionLevels += 1;

        this.run = {
            runId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            level: levelNumber,
            attempt: stats.attempts[key],
            isReplay,
            startedAt: Date.now(),
            sessionIndex: this.sessionLevels,
            ended: false
        };
        this.context = { level: levelNumber, runId: this.run.runId };
        this.saveStats(stats);
        this.emit("Level_Started", stats, extra);
    }

    /** Call once when the attempt is won. */
    static complete(extra: Extra = {}): void {
        const run = this.openRun();
        if (!run) return;
        run.ended = true;

        const stats = this.loadStats();
        const key = String(run.level);
        const firstClear = !stats.cleared[key];
        stats.cleared[key] = (stats.cleared[key] ?? 0) + 1;
        stats.completedToday += 1;
        stats.completedTotal += 1;
        stats.maxCompleted = Math.max(stats.maxCompleted, run.level);
        this.saveStats(stats);

        this.emit("Level_Completed", stats, {
            result: "win",
            is_first_clear: firstClear,
            duration_sec: this.elapsedSec(run),
            ...extra
        });
    }

    /** Call once when the attempt is lost. reason: why it was lost (game-specific). */
    static fail(reason: string, extra: Extra = {}): void {
        const run = this.openRun();
        if (!run) return;
        run.ended = true;

        const stats = this.loadStats();
        this.emit("Level_Failed", stats, {
            result: "lose",
            fail_reason: reason,
            duration_sec: this.elapsedSec(run),
            ...extra
        });
    }

    /** Call when the player leaves an open attempt. No-op if the attempt already ended. */
    static abandon(reason: string, extra: Extra = {}): void {
        const run = this.openRun();
        if (!run) return;
        run.ended = true;

        const stats = this.loadStats();
        this.emit("Level_Abandoned", stats, {
            result: "abandon",
            abandon_reason: reason,
            duration_sec: this.elapsedSec(run),
            ...extra
        });
    }

    /** Call when the player leaves the level for a menu, so menu events carry no level. */
    static clearContext(): void {
        this.context = null;
    }

    /**
     * Adds level props to any analytics event (Game_*, Coins_Earned, CTA, errors):
     * level_number + level_run_id while the player is in a level, and
     * max_level_completed always. Keys the caller already set are kept.
     */
    static addContext(metadata: Record<string, unknown>): void {
        if (this.context) {
            if (metadata.level_number === undefined) metadata.level_number = this.context.level;
            if (metadata.level_run_id === undefined) metadata.level_run_id = this.context.runId;
        }
        if (metadata.max_level_completed === undefined) metadata.max_level_completed = this.loadStats().maxCompleted;
    }

    static get hasOpenRun(): boolean {
        return !!this.run && !this.run.ended;
    }

    // ── internals ───────────────────────────────────────────────────────────

    private static openRun(): LevelRun | null {
        return this.run && !this.run.ended ? this.run : null;
    }

    private static elapsedSec(run: LevelRun): number {
        return Math.max(0, Math.round((Date.now() - run.startedAt) / 1000));
    }

    private static emit(eventName: string, stats: LevelStats, extra: Extra): void {
        const run = this.run!;
        shopsyBridge.analyticsEvent(eventName, {
            game_id: GAME_ID,
            game_name: GAME_NAME,
            schema_version: SCHEMA_VERSION,
            level_number: run.level,
            level_run_id: run.runId,
            level_attempt: run.attempt,
            is_replay: run.isReplay,
            day_ist: stats.day,
            levels_played_today: stats.playedToday,
            levels_completed_today: stats.completedToday,
            levels_played_total: stats.playedTotal,
            levels_completed_total: stats.completedTotal,
            max_level_completed: stats.maxCompleted,
            session_level_index: run.sessionIndex,
            daily_attempt_number: PlayerPrefs.gamesPlayedToday,
            ...extra
        });
    }

    private static loadStats(): LevelStats {
        let raw: unknown = PlayerPrefs.getValue(LEVEL_STATS_KEY, null);
        if (raw == null) {
            try { raw = window.localStorage.getItem(LOCAL_MIRROR_KEY); } catch { raw = null; }
        }
        let stats = emptyStats();
        try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (parsed && typeof parsed === "object") stats = { ...stats, ...(parsed as Partial<LevelStats>) };
        } catch { /* corrupt value: start fresh */ }
        stats.attempts = stats.attempts ?? {};
        stats.cleared = stats.cleared ?? {};

        const today = istDay();
        if (stats.day !== today) {
            stats.day = today;
            stats.playedToday = 0;
            stats.completedToday = 0;
        }
        return stats;
    }

    private static saveStats(stats: LevelStats): void {
        const json = JSON.stringify(stats);
        PlayerPrefs.setValue(LEVEL_STATS_KEY, json);
        try { window.localStorage.setItem(LOCAL_MIRROR_KEY, json); } catch { /* storage blocked */ }
    }
}

// Every analytics event sent through the bridge gets the level props.
shopsyBridge.setAnalyticsContextProvider((metadata) => LevelAnalytics.addContext(metadata));
