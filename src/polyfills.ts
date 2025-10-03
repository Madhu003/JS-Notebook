// Additional polyfills for ES5 compatibility

// Promise polyfill for IE
if (typeof Promise === 'undefined') {
  import('es6-promise/auto');
}

// Object.assign polyfill for IE
if (typeof Object.assign !== 'function') {
  Object.assign = function(target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target);

    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];

      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Array.from polyfill for IE
if (!Array.from) {
  Array.from = (function () {
    const toStr = Object.prototype.toString;
    const isCallable = function (fn: any) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    const toInteger = function (value: any) {
      const number = Number(value);
      if (isNaN(number)) return 0;
      if (number === 0 || !isFinite(number)) return number;
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    const maxSafeInteger = 9007199254740991;
    const toLength = function (value: any) {
      const len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    return function from(this: any, arrayLike: any, mapFn?: any, thisArg?: any) {
      const C = this;
      const items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      const mapFunction = mapFn;
      const T = thisArg;
      const len = toLength(items.length);
      const A = isCallable(C) ? Object(new C(len)) : new Array(len);

      let k = 0;
      const kValue = function (value: any) {
        const mappedValue = mapFunction ? mapFunction(T, value, k) : value;
        return mappedValue;
      };

      while (k < len) {
        A[k] = kValue(items[k]);
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}

// Array.find polyfill for IE
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate: any, thisArg?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    const list = Object(this);
    const length = parseInt(list.length || 0, 10);
    for (let i = 0; i < length; i++) {
      const value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

// Array.includes polyfill for IE
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement: any, fromIndex?: number) {
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }
    const O = Object(this);
    const len = parseInt(O.length || 0, 10);
    if (len === 0) return false;
    const n = parseInt(fromIndex || 0, 10);
    let k = n >= 0 ? n : Math.max(len + n, 0);
    while (k < len) {
      if (O[k] === searchElement) {
        return true;
      }
      k++;
    }
    return false;
  };
}

// String.includes polyfill for IE
if (!String.prototype.includes) {
  String.prototype.includes = function (search: any, start?: number) {
    if (typeof start !== 'number') {
      start = 0;
    }
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// String.startsWith polyfill for IE
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString: any, position?: number) {
    const start = position || 0;
    return this.substring(start, start + searchString.length) === searchString;
  };
}

// String.endsWith polyfill for IE
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString: any, length?: number) {
    const end = length === undefined ? this.length : length;
    const start = end - searchString.length;
    return start >= 0 && this.substring(start, end) === searchString;
  };
}

// Map polyfill for IE (basic implementation)
if (typeof Map === 'undefined') {
  (globalThis as any).Map = class Map {
    private _keys: any[] = [];
    private _values: any[] = [];
    
    set(key: any, value: any) {
      const index = this._keys.indexOf(key);
      if (index >= 0) {
        this._values[index] = value;
      } else {
        this._keys.push(key);
        this._values.push(value);
      }
      return this;
    }
    
    get(key: any) {
      const index = this._keys.indexOf(key);
      return index >= 0 ? this._values[index] : undefined;
    }
    
    has(key: any) {
      return this._keys.indexOf(key) >= 0;
    }
    
    delete(key: any) {
      const index = this._keys.indexOf(key);
      if (index >= 0) {
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        return true;
      }
      return false;
    }
    
    forEach(callback: Function) {
      for (let i = 0; i < this._keys.length; i++) {
        callback(this._values[i], this._keys[i]);
      }
    }
  };
}

// Set polyfill for IE (basic implementation)
if (typeof Set === 'undefined') {
  (globalThis as any).Set = class Set {
    private _values: any[] = [];
    
    add(value: any) {
      if (this._values.indexOf(value) === -1) {
        this._values.push(value);
      }
      return this;
    }
    
    has(value: any) {
      return this._values.indexOf(value) >= 0;
    }
    
    delete(value: any) {
      const index = this._values.indexOf(value);
      if (index >= 0) {
        this._values.splice(index, 1);
        return true;
      }
      return false;
    }
    
    forEach(callback: Function) {
      for (let i = 0; i < this._values.length; i++) {
        callback(this._values[i], this._values[i]);
      }
    }
    
    get size() {
      return this._values.length;
    }
  };
}

console.log('✅ ES5 Polyfills loaded successfully');
