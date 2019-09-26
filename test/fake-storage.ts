/**
 * Emulates the `localStorage` browser API.
 */
export class FakeStorage {
  _items: { [key: string]: string }

  constructor(items = {}) {
    this._items = items
  }

  getItem(key: string): string | null {
    return key in this._items ? this._items[key] : null
  }

  setItem(key: string, value: string): void {
    this._items[key] = value
  }

  removeItem(key: string): void {
    delete this._items[key]
  }

  key(n: number): string {
    return Object.keys(this._items)[n]
  }

  clear(): void {
    this._items = {}
  }

  get length(): number {
    return Object.keys(this._items).length
  }
}
