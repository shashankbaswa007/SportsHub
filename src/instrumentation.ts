/**
 * Next.js Instrumentation Hook
 * 
 * Runs once when the Next.js server starts, before any other server-side code.
 * 
 * Fixes: Node.js 22+ exposes a global `localStorage` object when the
 * `--localstorage-file` flag is present, but if no valid path is provided
 * the methods (getItem, setItem, etc.) are undefined. This breaks libraries
 * like Firebase Auth and next-themes that check `typeof localStorage !== 'undefined'`
 * before calling `localStorage.getItem()`.
 *
 * The fix replaces the broken global with a functional in-memory implementation
 * so SSR / server-side code never crashes.
 */
export async function register() {
  if (
    typeof globalThis.localStorage !== 'undefined' &&
    typeof globalThis.localStorage.getItem !== 'function'
  ) {
    const store = new Map<string, string>();

    globalThis.localStorage = {
      getItem(key: string): string | null {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string): void {
        store.set(key, String(value));
      },
      removeItem(key: string): void {
        store.delete(key);
      },
      clear(): void {
        store.clear();
      },
      get length(): number {
        return store.size;
      },
      key(index: number): string | null {
        return [...store.keys()][index] ?? null;
      },
    } as Storage;
  }
}
