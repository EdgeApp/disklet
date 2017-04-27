/**
 * Emulates the `localStorage` browser API.
 */
export class FakeStorage {
  constructor (items = {}) {
    this._items = items
  }

  getItem (key) {
    return key in this._items ? this._items[key] : null
  }

  setItem (key, value) {
    this._items[key] = value
  }

  removeItem (key) {
    delete this._items[key]
  }

  key (n) {
    return Object.keys(this._items)[n]
  }

  clear () {
    this._items = {}
  }
}

Object.defineProperty(FakeStorage.prototype, 'length', {
  get: function () {
    return Object.keys(this._items).length
  }
})
