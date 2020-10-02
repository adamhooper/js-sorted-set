
class Iterator {
  constructor(priv, index1) {
    this.priv = priv;
    this.index = index1;
    this.data = this.priv.data;
  }

  hasNext() {
    return this.index < this.data.length;
  }

  hasPrevious() {
    return this.index > 0;
  }

  value() {
    if (this.index < this.data.length) {
      return this.data[this.index];
    } else {
      return null;
    }
  }

  setValue(value) {
    if (!this.priv.options.allowSetValue) {
      throw 'Must set options.allowSetValue';
    }
    if (!this.hasNext()) {
      throw 'Cannot set value at end of set';
    }
    return this.data[this.index] = value;
  }

  next() {
    if (this.index >= this.data.length) {
      return null;
    } else {
      return new Iterator(this.priv, this.index + 1);
    }
  }

  previous() {
    if (this.index <= 0) {
      return null;
    } else {
      return new Iterator(this.priv, this.index - 1);
    }
  }

};

const binarySearchForIndex = (array, value, comparator) => {
  let low = 0;
  let high = array.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (comparator(array[mid], value) < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
};

class ArrayStrategy {
  constructor(options) {
    this.options = options;
    this.onInsertConflict = this.options.onInsertConflict;
    this.comparator = this.options.comparator;
    this.data = [];
  }

  toArray() {
    return this.data;
  }

  insert(value) {
    const index = binarySearchForIndex(this.data, value, this.comparator);
    if (this.data[index] !== void 0 && this.comparator(this.data[index], value) === 0) {
      return this.data.splice(index, 1, this.onInsertConflict(this.data[index], value));
    } else {
      return this.data.splice(index, 0, value);
    }
  }

  remove(value) {
    const index = binarySearchForIndex(this.data, value, this.comparator);
    if (this.comparator(this.data[index], value) !== 0) {
      throw 'Value not in set';
    }
    return this.data.splice(index, 1);
  }

  clear() {
    return this.data.length = 0;
  }

  contains(value) {
    const index = binarySearchForIndex(this.data, value, this.comparator);
    return this.index !== this.data.length && this.comparator(this.data[index], value) === 0;
  }

  forEachImpl(callback, sortedSet, thisArg) {
    const data = this.data;
    const len = data.length;
    for (let i = 0; i < len; i++) {
      callback.call(thisArg, data[i], i, sortedSet);
    }
  }

  findIterator(value) {
    const index = binarySearchForIndex(this.data, value, this.comparator);
    return new Iterator(this, index);
  }

  beginIterator() {
    return new Iterator(this, 0);
  }

  endIterator() {
    return new Iterator(this, this.data.length);
  }
};

export default ArrayStrategy;
