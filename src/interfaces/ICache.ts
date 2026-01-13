export interface ICache<T> {
  set(key: string, value: T): void;
  get(key: string): T | null;
  clear(): void;
  flush(): void;
  size(): number;
}
