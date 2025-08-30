import { Injectable, signal, computed, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface StateConfig {
  persist?: boolean;
  storageKey?: string;
  debounceMs?: number;
}

export abstract class BaseStateService<T extends Record<string, any>> {
  protected state = signal<T>(this.getInitialState());
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  // Computed signals
  public readonly currentState = this.state.asReadonly();
  public readonly isLoading = this.loading.asReadonly();
  public readonly currentError = this.error.asReadonly();

  // RxJS compatibility
  private stateSubject = new BehaviorSubject<T>(this.getInitialState());
  public state$ = this.stateSubject.asObservable();

  constructor(protected config: StateConfig = {}) {
    // Set up persistence if enabled
    if (config.persist && config.storageKey) {
      this.setupPersistence();
    }

    // Set up state synchronization
    effect(() => {
      const currentState = this.state();
      this.stateSubject.next(currentState);

      // Persist to storage if enabled
      if (this.config.persist && this.config.storageKey) {
        this.persistState(currentState);
      }
    });
  }

  /**
   * Get the initial state - must be implemented by subclasses
   */
  protected abstract getInitialState(): T;

  /**
   * Update state partially
   */
  protected updateState(updates: Partial<T>): void {
    this.state.update(current => ({ ...current, ...updates }));
  }

  /**
   * Update state with a function
   */
  protected updateStateFn(updater: (current: T) => T): void {
    this.state.update(updater);
  }

  /**
   * Set state completely
   */
  protected setState(newState: T): void {
    this.state.set(newState);
  }

  /**
   * Reset state to initial values
   */
  public resetState(): void {
    this.state.set(this.getInitialState());
    this.error.set(null);
    this.loading.set(false);
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  /**
   * Set error state
   */
  protected setError(error: string | null): void {
    this.error.set(error);
  }

  /**
   * Clear error state
   */
  public clearError(): void {
    this.error.set(null);
  }

  /**
   * Get current state value
   */
  public getState(): T {
    return this.state();
  }

  /**
   * Get specific property from state
   */
  public get<K extends keyof T>(key: K): T[K] {
    return this.state()[key];
  }

  /**
   * Check if state has specific property with value
   */
  public has<K extends keyof T>(key: K, value?: T[K]): boolean {
    const currentValue = this.state()[key];
    return value !== undefined ? currentValue === value : currentValue != null;
  }

  /**
   * Create a computed signal for a specific property
   */
  public select<K extends keyof T>(key: K) {
    return computed(() => this.state()[key]);
  }

  /**
   * Create a computed signal with a selector function
   */
  public selectFn<R>(selector: (state: T) => R) {
    return computed(() => selector(this.state()));
  }

  /**
   * Set up persistence with localStorage
   */
  private setupPersistence(): void {
    if (!this.config.storageKey) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsedState = JSON.parse(stored);
        // Merge stored state with initial state to handle schema changes
        const mergedState = { ...this.getInitialState(), ...parsedState };
        this.state.set(mergedState);
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  }

  /**
   * Persist state to localStorage
   */
  private persistState(state: T): void {
    if (!this.config.storageKey) return;

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error persisting state:', error);
    }
  }

  /**
   * Clear persisted state
   */
  public clearPersistedState(): void {
    if (this.config.storageKey) {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  /**
   * Export state for debugging
   */
  public exportState(): T {
    return { ...this.state() };
  }

  /**
   * Import state (useful for testing or state restoration)
   */
  public importState(newState: T): void {
    this.state.set({ ...this.getInitialState(), ...newState });
  }

  /**
   * Get state as observable (RxJS compatibility)
   */
  public asObservable(): Observable<T> {
    return this.state$;
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(callback: (state: T) => void): () => void {
    const subscription = this.state$.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  /**
   * Create an effect that runs when specific state properties change
   */
  public createEffect<K extends keyof T>(
    keys: K[],
    effectFn: (values: Pick<T, K>) => void
  ) {
    return effect(() => {
      const values = keys.reduce((acc, key) => {
        acc[key] = this.state()[key];
        return acc;
      }, {} as Pick<T, K>);

      effectFn(values);
    });
  }
}