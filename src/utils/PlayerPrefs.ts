import { shopsyBridge, ShopsyMessageAction } from '../shopsystan/shopsyBridge';

type PendingRequest = {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timeout: ReturnType<typeof setTimeout>;
};

const LEGACY_PREFIX = 'shopsy_nazaria_';
const REQUEST_TIMEOUT_MS = 1000;

const hasLocalStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export class PlayerPrefs {
  private static cache = new Map<string, any>();
  private static pendingRequests = new Map<string, PendingRequest[]>();
  private static initialized = false;
  private static legacyMigrated = false;
  private static hydrationPromise: Promise<void> | null = null;
  private static hydrationComplete = false;

  static init(): void {
    if (this.initialized) return;
    this.initialized = true;

    shopsyBridge.on(ShopsyMessageAction.PLAYER_PREF_VALUE, (data) => {
      const key = data?.key;
      if (!key) return;
      this.cache.set(key, data.value);
      const queue = this.pendingRequests.get(key);
      if (queue?.length) {
        queue.forEach(({ resolve, timeout }) => {
          clearTimeout(timeout);
          resolve(data.value);
        });
        this.pendingRequests.delete(key);
      }
    });

    shopsyBridge.on(ShopsyMessageAction.USER_LOGGED_OUT, () => {
      this.clear();
      this.legacyMigrated = false;
      this.hydrationComplete = false;
    });
  }

  static hydrate(): Promise<void> {
    this.init();
    if (this.hydrationPromise) {
      return this.hydrationPromise;
    }

    console.log('hydrating PlayerPrefs');
    this.hydrationComplete = false;

    const requests = [
      this.requestValue('last_login_date', ''),
      this.requestValue('games_played_today', 0),
      this.requestValue('games_played_total', 0),
      this.requestValue('has_seen_tutorial', false),
      this.requestValue('has_seen_gameplay_tutorial', false),
      this.requestValue('level_stats_v1', null),
    ];

    this.hydrationPromise = Promise.all(requests)
      .catch((error) => {
        console.warn('[PlayerPrefs] Hydration fallback to defaults:', error);
      })
      .finally(() => {
        this.hydrationPromise = null;
        this.hydrationComplete = true;
      });

    return this.hydrationPromise;
  }



  static migrateLegacyPrefs(): void {
    if (this.legacyMigrated || !hasLocalStorage()) {
      return;
    }

    const storage = window.localStorage;
    const payload: Record<string, string> = {};
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith(LEGACY_PREFIX)) {
        const value = storage.getItem(key);
        if (value != null) {
          payload[key] = value;
        }
      }
    }

    if (Object.keys(payload).length) {
      shopsyBridge.migratePlayerPrefs(payload);
    }

    this.legacyMigrated = true;
  }

  private static requestValue(key: string, defaultValue: any): Promise<any> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.removePending(key, resolve);
        console.warn(`[NazariaPlayerPrefs] Timeout waiting for ${key}`);
        resolve(defaultValue);
      }, REQUEST_TIMEOUT_MS);

      const queue = this.pendingRequests.get(key) ?? [];
      queue.push({ resolve, reject: () => undefined, timeout });
      this.pendingRequests.set(key, queue);

      shopsyBridge.getPlayerPref(key, defaultValue);
    });
  }

  private static removePending(key: string, resolver: (value: any) => void) {
    const queue = this.pendingRequests.get(key);
    if (!queue) return;
    const idx = queue.findIndex((entry) => entry.resolve === resolver);
    if (idx >= 0) {
      queue.splice(idx, 1);
    }
    if (!queue.length) {
      this.pendingRequests.delete(key);
    }
  }

  static clear(): void {
    this.cache.clear();
    this.pendingRequests.forEach((entries) =>
      entries.forEach(({ timeout }) => clearTimeout(timeout))
    );
    this.pendingRequests.clear();
    this.hydrationPromise = null;
    this.hydrationComplete = false;
  }

  private static read<T>(key: string, fallback: T): T {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      return (value === undefined ? fallback : value) as T;
    }
    return fallback;
  }

  private static write(key: string, value: any): void {
    this.init();
    this.cache.set(key, value);
    shopsyBridge.setPlayerPref(key, value);
  }

  static setMany(entries: Array<[string, any]>): void {
    if (!entries.length) {
      return;
    }
    this.init();
    entries.forEach(([key, value]) => {
      this.cache.set(key, value);
    });
    entries.forEach(([key, value]) => {
      shopsyBridge.setPlayerPref(key, value);
    });
  }

  /** Generic accessors for keys owned by other modules (e.g. level analytics). */
  static getValue<T>(key: string, fallback: T): T {
    return this.read(key, fallback);
  }

  static setValue(key: string, value: any): void {
    this.write(key, value);
  }

  static get lastLoginDate(): string {
    return this.read('last_login_date', '');
  }

  static set lastLoginDate(value: string) {
    this.write('last_login_date', value);
  }

  static get gamesPlayedToday(): number {
    return this.read('games_played_today', 0);
  }

  static set gamesPlayedToday(value: number) {
    this.write('games_played_today', value);
  }

  static get gamesPlayedTotal(): number {
    return this.read('games_played_total', 0);
  }

  static set gamesPlayedTotal(value: number) {
    this.write('games_played_total', value);
  }

  static get isNewDay(): boolean {
    const last = new Date(this.lastLoginDate);
    const now = new Date();
    return (
      last.getUTCFullYear() !== now.getUTCFullYear() ||
      last.getUTCMonth() !== now.getUTCMonth() ||
      last.getUTCDate() !== now.getUTCDate()
    );
  }

  static get hasSeenTutorial(): boolean {
    return this.read('has_seen_tutorial', false);
  }

  static set hasSeenTutorial(value: boolean) {
    this.write('has_seen_tutorial', value);
  }

  static get hasSeenGameplayTutorial(): boolean {
    return this.read('has_seen_gameplay_tutorial', false);
  }

  static set hasSeenGameplayTutorial(value: boolean) {
    this.write('has_seen_gameplay_tutorial', value);
  }
}
