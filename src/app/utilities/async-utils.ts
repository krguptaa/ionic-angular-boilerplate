// Async Utilities
export class AsyncUtils {
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), ms)
      )
    ]);
  }

  static retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    return fn().catch(error => {
      if (maxAttempts <= 1) {
        throw error;
      }
      return this.delay(delayMs).then(() =>
        this.retry(fn, maxAttempts - 1, delayMs)
      );
    });
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: any = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    getKey?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, Promise<any>>();

    return ((...args: Parameters<T>) => {
      const key = getKey ? getKey(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      cache.set(key, result);

      // Clean up cache after promise resolves
      result.finally(() => cache.delete(key));

      return result;
    }) as T;
  }

  static parallelLimit<T>(
    tasks: (() => Promise<T>)[],
    limit: number
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let running = 0;
      let completed = 0;
      let nextIndex = 0;

      const runTask = () => {
        if (nextIndex >= tasks.length) {
          if (completed === tasks.length) {
            resolve(results);
          }
          return;
        }

        const currentIndex = nextIndex++;
        running++;

        tasks[currentIndex]()
          .then(result => {
            results[currentIndex] = result;
            running--;
            completed++;
            runTask();
          })
          .catch(reject);
      };

      // Start initial batch
      for (let i = 0; i < Math.min(limit, tasks.length); i++) {
        runTask();
      }
    });
  }

  static raceWithDefault<T>(
    promises: Promise<T>[],
    defaultValue: T,
    timeoutMs?: number
  ): Promise<T> {
    const racePromises = [...promises];

    if (timeoutMs) {
      racePromises.push(this.delay(timeoutMs).then(() => defaultValue));
    }

    return Promise.race(racePromises).catch(() => defaultValue);
  }
}