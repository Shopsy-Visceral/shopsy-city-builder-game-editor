// File: src/shopsystan/shopsyBridge.ts

/**
 * ShopsyStan web-side bridge module.
 *
 * This module is Phaser-agnostic: it does not import Phaser,
 * and can be used from any web app (Phaser Hub, Phaser game, or plain JS).
 */

export type ShopsyEnvironment = "android" | "ios" | "standalone";

// #region Core Messages

/**
 * Message type constants (Categories)
 */
export const ShopsyMessageType = {
    NAVIGATION: "navigation" as const,
    GAMEPLAY: "gameplay" as const,
    STATE_SYNC: "stateSync" as const,
    LOAD_FAILURE: "loadFailure" as const,
    NETWORK_INTERRUPTION: "networkInterruption" as const,
    ACTIVITY_RECREATION: "activityRecreation" as const,
    OUT_OF_MEMORY: "outOfMemory" as const,
    JS_ERROR: "jsError" as const,
    NAVIGATION_ERROR: "navigationError" as const,
    CRITICAL_FAILURE: "criticalFailure" as const,
    ANALYTICS_EVENT: "analyticsEvent" as const,
    SHARE: "share" as const,
    PLAYER_PREFS: "playerPrefs" as const,
} as const;

/**
 * Message action constants (Specific Actions)
 */
export const ShopsyMessageAction = {
    // Navigation actions
    LAUNCH_GAME: "launchGame" as const,
    HUB_LOADED: "hubLoaded" as const,
    HUB_UNLOADED: "hubUnloaded" as const,
    START_GAME: "startGame" as const,
    EXIT_GAME: "exitGame" as const,
    GAME_LOADED: "gameLoaded" as const,
    GAME_UNLOADED: "gameUnloaded" as const,
    BEGIN_GAME_EXIT: "beginGameExit" as const,
    REFRESH_WEBVIEW_FOR_HUB: "refreshWebViewForHub" as const,
    HUB_RELOADED: "hubReloaded" as const,
    CLOSE_SDK: "closeSdk" as const,

    // Gameplay actions
    ROUND_STARTED: "roundStarted" as const,
    GAME_COMPLETED: "gameCompleted" as const,
    GAME_STARTED_ACK: "gameStartedAck" as const,
    GAME_COMPLETED_ACK: "gameCompletedAck" as const,

    // Gullak actions
    CLAIM_GULLAK: 'claimGullak' as const,
    GULLAK_CLAIMED_ACK: 'gullakClaimedAck' as const,

    // State sync actions
    REQUEST_PROFILE: 'requestProfile' as const,
    UPDATE_PROFILE: 'updateProfile' as const,
    REQUEST_GAME_CONFIG: 'requestGameConfig' as const,
    UPDATE_GAME_CONFIG: 'updateGameConfig' as const,
    RESTORE_STATE: 'restoreState' as const,

    // Load failure actions
    HUB_LOAD_ERROR: "hubLoadError" as const,
    GAME_LOAD_ERROR: "gameLoadError" as const,
    WEBVIEW_TERMINATED: "webViewTerminated" as const,
    INTERNAL_ERROR: "internalError" as const,
    RETRY_LOAD: "retryLoad" as const,

    // Network interruption actions
    NETWORK_INTERRUPTED: "networkInterrupted" as const,
    NETWORK_RESTORED: "networkRestored" as const,
    NETWORK_LOAD_ERROR: "networkLoadError" as const,
    RETRY_AFTER_NETWORK: "retryAfterNetwork" as const,

    // Activity recreation actions
    RELOAD_WEBVIEW: "reloadWebView" as const,
    STATE_RESTORED: "stateRestored" as const,
    ACTIVITY_RECREATED: "activityRecreated" as const,

    // Out of memory actions
    LOW_MEMORY_WARNING: "lowMemoryWarning" as const,
    RECOVER_AFTER_OOM: "recoverAfterOOM" as const,
    RESTORE_STATE_AFTER_OOM: "restoreStateAfterOOM" as const,
    RECOVERY_COMPLETE_AFTER_OOM: "recoveryCompleteAfterOOM" as const,
    OOM_WEBVIEW_TERMINATED: "oomWebViewTerminated" as const,
    RECOVERY_IN_PROGRESS: "recoveryInProgress" as const,
    RECOVERY_OUTCOME: "recoveryOutcome" as const,

    // JS error actions
    JS_ERROR: "jsError" as const,
    FATAL_JS_ERROR: "fatalJsError" as const,
    RECOVER_FROM_JS_ERROR: "recoverFromJsError" as const,
    JS_ERROR_RECOVER_COMPLETE: "jsErrorRecoverComplete" as const,

    // Navigation error actions
    INVALID_NAVIGATION: "invalidNavigation" as const,
    NAVIGATION_BLOCKED: "navigationBlocked" as const,

    // Critical failure actions
    CRITICAL_FAILURE: "criticalFailure" as const,
    HOST_DECISION: "hostDecision" as const,

    // Analytics actions
    ANALYTICS_EVENT: "analyticsEvent" as const,

    // Share actions
    SHARE_CONTENT: "shareContent" as const,
    SHARE_SUCCESS: "shareSuccess" as const,
    SHARE_FAILED: "shareFailed" as const,
    COPY_TO_CLIPBOARD: "copyToClipboard" as const,

    // Player pref actions
    GET_PLAYER_PREF: "getPlayerPref" as const,
    SET_PLAYER_PREF: "setPlayerPref" as const,
    DELETE_PLAYER_PREF: "deletePlayerPref" as const,
    PLAYER_PREF_VALUE: "playerPrefValue" as const,
    MIGRATE_PLAYER_PREFS: "migratePlayerPrefs" as const,
    USER_LOGGED_OUT: "userLoggedOut" as const,
} as const;

// #endregion

/**
 * Major message categories (ShopsyMessageType)
 */
export type ShopsyMessageType = (typeof ShopsyMessageType)[keyof typeof ShopsyMessageType];

/**
 * Specific message actions (ShopsyMessageAction)
 */
export type ShopsyMessageAction = (typeof ShopsyMessageAction)[keyof typeof ShopsyMessageAction];

/**
 * Generic message envelope used for all communication.
 */
export interface ShopsyMessage<T = any> {
    type: ShopsyMessageType;
    action: ShopsyMessageAction;
    data?: T;
}

export interface ShareContentPayload extends Record<string, unknown> {
    image: string;
    title?: string;
}

/**
 * Optional options for initializing the bridge.
 */
export interface ShopsyBridgeOptions {
    /**
     * Custom logger function. Defaults to console.log if not provided.
     */
    logger?: (message: string, extra?: unknown) => void;

    /**
     * Optional hook to wire whatever downward message mechanism native uses.
     *
     * Example:
     *   initShopsyBridge({
     *     addNativeListener: (handler) => {
     *       window.addEventListener("message", (evt: MessageEvent) => {
     *         handler(evt.data);
     *       });
     *     }
     *   });
     *
     * If not provided, a default listener for the "messageFromNative" event is added.
     */
    addNativeListener?: (handler: (rawMessage: unknown) => void) => void;
}

/**
 * Handler type for downward events coming from native.
 */
export type ShopsyEventHandler<T = any> = (data: T, raw: ShopsyMessage<T>) => void;

/**
 * Public interface of the bridge.
 */
export interface ShopsyBridge {
    /** Detected environment: "android", "ios", or "standalone". */
    readonly env: ShopsyEnvironment;

    /** True if we have a native bridge (android or ios). */
    readonly isNative: boolean;

    /**
     * Initialize the bridge: detect environment, set up downward listeners, log mode.
     * Safe to call multiple times; later calls are no-ops.
     */
    init(options?: ShopsyBridgeOptions): void;

    /** Resolve once init finishes wiring listeners. */
    waitUntilReady(): Promise<void>;

    /**
     * Generic send: wraps { type, action, data } and forwards to the native layer if available.
     * In standalone mode this is a no-op plus logging.
     */
    send<T = any>(type: ShopsyMessageType, action: ShopsyMessageAction, data?: T): void;

    /**
     * Subscribe to a downward event type.
     *
     * Returns an unsubscribe function for convenience.
     */
    on<T = any>(type: string, handler: ShopsyEventHandler<T>): () => void;

    /**
     * Unsubscribe a handler from a given type.
     */
    off<T = any>(type: string, handler: ShopsyEventHandler<T>): void;

    /**
     * Entry point for raw messages coming from native.
     * The native side (or a window event) should eventually call this.
     */
    handleNativeMessage(raw: unknown): void;

    // Convenience helpers built on top of send():

    // Navigation
    launchGame(gameId: string): void;
    hubLoaded(): void;
    hubUnloaded(): void;
    startGame(): void;
    exitGame(): void;
    gameLoaded(): void;
    gameUnloaded(): void;
    closeSdk(): void;

    // Gameplay
    roundStarted(): void;
    gameCompleted(data?: Record<string, unknown>): void;

    claimGullak(): void;

    // StateSync
    requestProfile(): void;
    requestGameConfig(gameId: string): void;

    // Error reporting
    reportHubLoadError(error: string): void;
    reportGameLoadError(gameId: string, error: string): void;
    reportJsError(error: Error, context?: any): void;
    reportFatalJsError(error: Error, context?: any): void;
    reportInvalidNavigation(url: string): void;
    reportNavigationBlocked(reason: string): void;
    confirmStateRestored(): void;
    confirmRecoveryCompleteAfterOOM(): void;
    confirmJsErrorRecoveryComplete(): void;
    confirmHubReloaded(): void;

    // Analytics
    analyticsEvent(eventName: string, eventData?: Record<string, unknown>): void;
    /** Registers a hook that adds shared props (e.g. level_number) to every analytics event. */
    setAnalyticsContextProvider(provider: ((metadata: Record<string, unknown>) => void) | null): void;

    // Share
    shareContent(text: string, payload: ShareContentPayload): void;
    copyToClipboard(text: string): void;

    // Player prefs
    getPlayerPref(key: string, defaultValue?: any): void;
    setPlayerPref(key: string, value: any): void;
    deletePlayerPref(key: string): void;
    migratePlayerPrefs(prefs: Record<string, string>): void;
}

/**
 * Internal implementation of the ShopsyBridge interface.
 * Exposed as a singleton below.
 */
class ShopsyBridgeImpl implements ShopsyBridge {
    private _env: ShopsyEnvironment = "standalone";
    private analyticsContextProvider: ((metadata: Record<string, unknown>) => void) | null = null;
    private _initialized = false;
    private readyPromise: Promise<void>;
    private resolveReady?: () => void;
    private nativeListenerRegistered = false;

    // Map of event type -> set of handlers.
    private handlers: Map<string, Set<ShopsyEventHandler>> = new Map();

    // Queue of messages received before a handler was registered.
    private pendingMessages: Map<string, ShopsyMessage[]> = new Map();

    // Logger function, defaults to console.log.
    private logFn: (message: string, extra?: unknown) => void = (msg, extra) => {
        if (extra !== undefined) {
            // eslint-disable-next-line no-console
            console.log(msg, extra);
        } else {
            // eslint-disable-next-line no-console
            console.log(msg);
        }
    };

    constructor() {
        this.readyPromise = new Promise((resolve) => {
            this.resolveReady = resolve;
        });
    }

    public get env(): ShopsyEnvironment {
        return this._env;
    }

    public get isNative(): boolean {
        return this._env === "android" || this._env === "ios";
    }

    /**
     * Detects the environment by checking for bridge objects on window.
     */
    private detectEnvironment(): ShopsyEnvironment {
        if (typeof window === "undefined") {
            return "standalone";
        }

        const w = window as any;

        // Android: window.AndroidBridge.postMessage(jsonString)
        if (w.AndroidBridge && typeof w.AndroidBridge.postMessage === "function") {
            return "android";
        }

        // iOS: window.webkit.messageHandlers.ShopsyBridge.postMessage(jsonObject)
        if (
            w.webkit &&
            w.webkit.messageHandlers &&
            w.webkit.messageHandlers.ShopsyBridge &&
            typeof w.webkit.messageHandlers.ShopsyBridge.postMessage === "function"
        ) {
            return "ios";
        }

        // Default: running in a normal browser (no native bridge).
        return "standalone";
    }

    public waitUntilReady(): Promise<void> {
        return this.readyPromise;
    }

    /**
     * Initialize bridge once.
     */
    public init(options?: ShopsyBridgeOptions): void {
        if (this._initialized) {
            if (options?.logger) {
                this.logFn = options.logger;
            }
            return;
        }
        this._initialized = true;

        // Use custom logger if provided.
        if (options?.logger) {
            this.logFn = options.logger;
        }

        this._env = this.detectEnvironment();

        this.logFn("[ShopsyBridge] initialized", {
            env: this._env,
        });

        // Wire downward messages: either via custom hook or default window event.
        if (typeof window !== "undefined" && !this.nativeListenerRegistered) {
            if (options?.addNativeListener) {
                options.addNativeListener((raw) => this.handleNativeMessage(raw));
                this.nativeListenerRegistered = true;
            } else {
                const handler = (evt: Event) => {
                    const messageEvent = evt as MessageEvent;
                    this.handleNativeMessage(messageEvent.data);
                };
                window.addEventListener("message", handler);
                this.nativeListenerRegistered = true;
            }
        }

        this.resolveReady?.();
        this.resolveReady = undefined;
    }

    /**
     * Send a message upward to native.
     */
    public send<T = any>(type: ShopsyMessageType, action: ShopsyMessageAction, data?: T): void {
        const message: ShopsyMessage<T> = { type, action, data };

        if (typeof window === "undefined") {
            this.logFn("[ShopsyBridge] window undefined, cannot send", message);
            return;
        }

        const w = window as any;

        if (this._env === "android") {
            try {
                // Android expects a JSON string.
                const json = JSON.stringify(message);
                w.AndroidBridge.postMessage(json);
            } catch (err) {
                this.logFn("[ShopsyBridge] failed to send message to Android", err);
            }
            return;
        }

        if (this._env === "ios") {
            try {
                // iOS can receive a plain object.
                w.webkit.messageHandlers.ShopsyBridge.postMessage(message);
            } catch (err) {
                this.logFn("[ShopsyBridge] failed to send message to iOS", err);
            }
            return;
        }

        // Standalone browser: do nothing except log.
        this.logFn("[ShopsyBridge] standalone mode, not sending to native", message);
    }

    /**
     * Subscribe to downward events.
     */
    public on<T = any>(type: string, handler: ShopsyEventHandler<T>): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        const set = this.handlers.get(type)!;
        set.add(handler as ShopsyEventHandler);

        const queued = this.pendingMessages.get(type);
        if (queued && queued.length > 0) {
            this.logFn("[ShopsyBridge] replaying queued messages", { type, count: queued.length });
            queued.forEach((msg) => {
                try {
                    handler(msg.data, msg);
                } catch (err) {
                    this.logFn(`[ShopsyBridge] handler threw during replay ${type}`, err);
                }
            });
            this.pendingMessages.delete(type);
        }

        // Return unsubscribe function.
        return () => this.off(type, handler);
    }

    /**
     * Unsubscribe a handler.
     */
    public off<T = any>(type: string, handler: ShopsyEventHandler<T>): void {
        const set = this.handlers.get(type);
        if (!set) return;
        set.delete(handler as ShopsyEventHandler);
        if (set.size === 0) {
            this.handlers.delete(type);
        }
    }

    /**
     * Normalize and dispatch a raw message coming from native (downward).
     */
    public handleNativeMessage(raw: unknown): void {
        let msg: ShopsyMessage | null = null;

        // If it's a string, try to parse JSON.
        if (typeof raw === "string") {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === "object") {
                    msg = parsed as ShopsyMessage;
                }
            } catch (err) {
                this.logFn("[ShopsyBridge] failed to parse raw JSON message from native", {
                    raw,
                    err,
                });
                return;
            }
        } else if (raw && typeof raw === "object") {
            // If it's already an object, assume it's in our format.
            const maybe = raw as ShopsyMessage;
            if (typeof maybe.type === "string") {
                msg = maybe;
            }
        }

        if (!msg) {
            this.logFn("[ShopsyBridge] received invalid native message", raw);
            return;
        }

        const { type, action, data } = msg as any;

        // Use action as the event identifier for handlers
        const eventType = action || type;
        const set = this.handlers.get(eventType);

        if (!set || set.size === 0) {
            if (!this.pendingMessages.has(eventType)) {
                this.pendingMessages.set(eventType, []);
            }
            this.pendingMessages.get(eventType)!.push(msg);
            this.logFn("[ShopsyBridge] queued message (no handler yet)", eventType);
            return;
        }

        // Dispatch to all registered handlers for this action.
        set.forEach((handler) => {
            try {
                handler(data, msg!);
            } catch (err) {
                this.logFn("[ShopsyBridge] handler threw for action " + eventType, err);
            }
        });
    }


    // #region Core Messages - Navigation

    /**
     * Sent by the Hub when the user taps a building.
     * The SDK responds by opening GameActivity with the provided gameId.
     */
    public launchGame(gameId: string): void {
        // TODO: Hub is unloaded and webview is prepared for loading game
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.LAUNCH_GAME,
            { gameId }
        );
    }

    /**
     * Emitted by the hub when it is loaded
     */
    public hubLoaded(): void {
        // TODO: No further action. Just acknowledged
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.HUB_LOADED
        );
    }

    /**
     * Emitted by the hub when it is unloaded
     */
    public hubUnloaded(): void {
        // TODO: No further action. Just acknowledged
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.HUB_UNLOADED
        );
    }

    /**
     * Emitted by the game when it starts
     */
    public startGame(): void {
        // No further action. Just acknowledged
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.START_GAME
        );
    }

    /**
     * Sent by the game when the user chooses to return to the Hub.
     * The SDK closes GameActivity and reopens the Hub
     */
    public exitGame(): void {
        // Game is unloaded and webview is prepared for loading the Hub
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.EXIT_GAME
        );
    }

    /**
     * Emitted by the game when it loads
     */
    public gameLoaded(): void {
        // No further action. Just acknowledged
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.GAME_LOADED
        );
    }

    /**
     * Emitted by the game when it unloads
     */
    public gameUnloaded(): void {
        // TODO: No further action. Just acknowledged
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.GAME_UNLOADED
        );
    }

    /**
     * Sent by the game when the user chooses to return to the Hub.
     * The SDK closes GameActivity and reopens the Hub
     */
    public closeSdk(): void {
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.CLOSE_SDK
        );
    }

    // #endregion

    // #region Core Messages - Gameplay
    public roundStarted(): void {
        // TODO: Any game start logic that may exist. RN responds with gameStartedAck
        this.send(
            ShopsyMessageType.GAMEPLAY,
            ShopsyMessageAction.ROUND_STARTED
        );
    }

    /**
     * Used when a game session ends with a result.
     */
    public gameCompleted(data?: Record<string, unknown>): void {
        // TODO: Any game complete logic that may exist
        this.send(
            ShopsyMessageType.GAMEPLAY,
            ShopsyMessageAction.GAME_COMPLETED,
            data
        );
    }

    // #endregion

    // #region Core Messages - StateSync

    /**
     * Sent by the Hub or a game to ask for the user profile.
     * The SDK responds with updateProfile.
     */
    public requestProfile(): void {
        // TODO: RN acknowledges and sends updateProfile
        this.send(
            ShopsyMessageType.STATE_SYNC,
            ShopsyMessageAction.REQUEST_PROFILE
        );
    }

    public claimGullak(): void {
        console.log("[ShopsyBridge] claimGullak");
        // TODO: RN acknowledges and sends gullakClaimedAck
        this.send(
            ShopsyMessageType.GAMEPLAY,
            ShopsyMessageAction.CLAIM_GULLAK
        );
    }


    /**
    * Request game configuration from SDK
    * @param gameId - The ID of the game requesting config
    * SDK will respond with UPDATE_GAME_CONFIG message containing JSON string
    */
    public requestGameConfig(gameId: string): void {
        this.send(
            ShopsyMessageType.STATE_SYNC,
            ShopsyMessageAction.REQUEST_GAME_CONFIG,
            { gameId }
        );
    }

    // #endregion

    // #region Error Messages

    /**
     * When the Hub UI (game list/navigation) fails to load
     */
    public reportHubLoadError(error: string): void {
        // TODO: Hub is unloaded and an error message is generated on the RN layer
        this.send(
            ShopsyMessageType.LOAD_FAILURE,
            ShopsyMessageAction.HUB_LOAD_ERROR,
            { error }
        );
    }

    /**
     * When an individual game fails to load due to network/resource/rendering issues
     */
    public reportGameLoadError(gameId: string, error: string): void {
        // TODO: Game is unloaded and an error message is generated on the RN layer
        this.send(
            ShopsyMessageType.LOAD_FAILURE,
            ShopsyMessageAction.GAME_LOAD_ERROR,
            { gameId, error }
        );
    }

    /**
     * For handled or recoverable JS exceptions that should be logged but do not immediately break UI
     */
    public reportJsError(error: Error, context?: any): void {
        // TODO: If the origin is Hub or Game then raise an event in the RN Layer
        this.send(
            ShopsyMessageType.JS_ERROR,
            ShopsyMessageAction.JS_ERROR,
            {
                message: error.message,
                stack: error.stack,
                context
            }
        );
    }

    /**
     * For unrecoverable UI states or crashes (React boundary failure, render loop break, etc.)
     */
    public reportFatalJsError(error: Error, context?: any): void {
        // TODO: If the origin is Hub or Game then raise an event in the RN Layer
        this.send(
            ShopsyMessageType.JS_ERROR,
            ShopsyMessageAction.FATAL_JS_ERROR,
            {
                message: error.message,
                stack: error.stack,
                context
            }
        );
    }

    /**
     * When the Hub attempts to navigate to an unknown game or unsupported URL
     */
    public reportInvalidNavigation(url: string): void {
        // TODO: Log an error in the RN layer and block navigation
        this.send(
            ShopsyMessageType.NAVIGATION_ERROR,
            ShopsyMessageAction.INVALID_NAVIGATION,
            { url }
        );
    }

    /**
     * If needed, the web layer acknowledges it has handled the UI fallback
     */
    public reportNavigationBlocked(reason: string): void {
        // TODO: Log an error in the RN layer and block navigation
        this.send(
            ShopsyMessageType.NAVIGATION_ERROR,
            ShopsyMessageAction.NAVIGATION_BLOCKED,
            { reason }
        );
    }

    /**
     * The web layer confirms correct rehydration after activity recreation
     */
    public confirmStateRestored(): void {
        // TODO: No further action. Just acknowledged
        this.send(
            ShopsyMessageType.ACTIVITY_RECREATION,
            ShopsyMessageAction.STATE_RESTORED
        );
    }

    /**
     * The web layer confirms state hydration after OOM reload
     */
    public confirmRecoveryCompleteAfterOOM(): void {
        // TODO: No further action. Just acknowledged
        this.send(
            ShopsyMessageType.OUT_OF_MEMORY,
            ShopsyMessageAction.RECOVERY_COMPLETE_AFTER_OOM
        );
    }

    /**
     * The web layer confirms JS error recovery is complete
     */
    public confirmJsErrorRecoveryComplete(): void {
        this.send(
            ShopsyMessageType.JS_ERROR,
            ShopsyMessageAction.JS_ERROR_RECOVER_COMPLETE
        );
    }

    /**
     * The hub confirms it has reloaded successfully after an exit
     */
    public confirmHubReloaded(): void {
        this.send(
            ShopsyMessageType.NAVIGATION,
            ShopsyMessageAction.HUB_RELOADED
        );
    }

    // #endregion

    // #region Analytics Events

    /**
     * Send a generic analytics event with custom event name and data
     * @param eventName - Name of the analytics event (e.g., 'game_start', 'building_tapped')
     * @param eventData - Optional event-specific data payload
     */
    public setAnalyticsContextProvider(provider: ((metadata: Record<string, unknown>) => void) | null): void {
        this.analyticsContextProvider = provider;
    }

    public analyticsEvent(eventName: string, eventData?: Record<string, unknown>): void {
        const metadata: Record<string, unknown> = { ...(eventData || {}) };
        try { this.analyticsContextProvider?.(metadata); } catch (err) { this.logFn("[ShopsyBridge] analytics context failed", err); }
        this.send(
            ShopsyMessageType.ANALYTICS_EVENT,
            ShopsyMessageAction.ANALYTICS_EVENT,
            {
                eventName,
                timestamp: Math.floor(new Date().getTime() / 1000),
                metadata  // ← Nest instead of spread
            }
        );
    }

    // #endregion

    // #region Share

    public shareContent(text: string, payload: ShareContentPayload): void {
        this.send(
            ShopsyMessageType.SHARE,
            ShopsyMessageAction.SHARE_CONTENT,
            { text, ...payload }
        );
    }

    public copyToClipboard(text: string): void {
        this.send(
            ShopsyMessageType.SHARE,
            ShopsyMessageAction.COPY_TO_CLIPBOARD,
            { text }
        );
    }

    // #endregion

    // #region Player Prefs

    public getPlayerPref(key: string, defaultValue?: any): void {
        this.send(
            ShopsyMessageType.PLAYER_PREFS,
            ShopsyMessageAction.GET_PLAYER_PREF,
            { key, defaultValue }
        );
    }

    public setPlayerPref(key: string, value: any): void {
        this.send(
            ShopsyMessageType.PLAYER_PREFS,
            ShopsyMessageAction.SET_PLAYER_PREF,
            { key, value }
        );
    }

    public deletePlayerPref(key: string): void {
        this.send(
            ShopsyMessageType.PLAYER_PREFS,
            ShopsyMessageAction.DELETE_PLAYER_PREF,
            { key }
        );
    }

    public migratePlayerPrefs(prefs: Record<string, string>): void {
        this.send(
            ShopsyMessageType.PLAYER_PREFS,
            ShopsyMessageAction.MIGRATE_PLAYER_PREFS,
            { prefs }
        );
    }

    // #endregion
}

// Singleton instance.
const instance = new ShopsyBridgeImpl();

/**
 * Exported singleton bridge instance.
 *
 * You can import this directly:
 *   import { shopsyBridge } from "./shopsystan/shopsyBridge";
 */
export const shopsyBridge: ShopsyBridge = instance;

/**
 * Helper to initialize the bridge and get the instance.
 *
 * Usage:
 *   const bridge = initShopsyBridge();
 *   bridge.launchGame("my-game-id");
 */
export function initShopsyBridge(options?: ShopsyBridgeOptions): ShopsyBridge {
    instance.init(options);
    return instance;
}
