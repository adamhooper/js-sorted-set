
class AbstractSortedSet {
  constructor(options) {
    if ((options != null ? options.strategy : void 0) == null) {
      throw 'Must pass options.strategy, a strategy';
    }
    if ((options != null ? options.comparator : void 0) == null) {
      throw 'Must pass options.comparator, a comparator';
    }
    if ((options != null ? options.onInsertConflict : void 0) == null) {
      throw 'Must pass options.onInsertConflict, a function';
    }
    this.priv = new options.strategy(options);
    this.length = 0;
  }

  insert(value) {
    this.priv.insert(value);
    this.length += 1;
    return this;
  }

  remove(value) {
    this.priv.remove(value);
    this.length -= 1;
    return this;
  }

  clear() {
    this.priv.clear();
    this.length = 0;
    return this;
  }

  contains(value) {
    return this.priv.contains(value);
  }

  // Returns this set as an Array
  toArray() {
    return this.priv.toArray();
  }

  forEach(callback, thisArg) {
    this.priv.forEachImpl(callback, this, thisArg);
    return this;
  }

  map(callback, thisArg) {
    const ret = [];
    this.forEach(function(value, index, self) {
      return ret.push(callback.call(thisArg, value, index, self));
    });
    return ret;
  }

  filter(callback, thisArg) {
    const ret = [];
    this.forEach(function(value, index, self) {
      if (callback.call(thisArg, value, index, self)) {
        return ret.push(value);
      }
    });
    return ret;
  }

  every(callback, thisArg) {
    let ret = true;
    this.forEach(function(value, index, self) {
      if (ret && !callback.call(thisArg, value, index, self)) {
        ret = false;
      }
    });
    return ret;
  }

  some(callback, thisArg) {
    let ret = false;
    this.forEach(function(value, index, self) {
      if (!ret && callback.call(thisArg, value, index, self)) {
        ret = true;
      }
    });
    return ret;
  }

  // An iterator is similar to a C++ iterator: it points _before_ a value.

  // So in this sorted set:

  //   | 1 | 2 | 3 | 4 | 5 |
  //   ^a      ^b          ^c

  // `a` is a pointer to the beginning of the iterator. `a.value()` returns
  // `3`. `a.previous()` returns `null`. `a.setValue()` works, if
  // `options.allowSetValue` is true.

  // `b` is a pointer to the value `3`. `a.previous()` and `a.next()` both do
  // the obvious.

  // `c` is a pointer to the `null` value. `c.previous()` works; `c.next()`
  // returns null. `c.setValue()` throws an exception, even if
  // `options.allowSetValue` is true.

  // Iterators have `hasNext()` and `hasPrevious()` methods, too.

  // Iterators are immutible. `iterator.next()` returns a new iterator.

  // Iterators become invalid as soon as `insert()` or `remove()` is called.
  findIterator(value) {
    return this.priv.findIterator(value);
  }

  // Finds an iterator pointing to the lowest possible value.
  beginIterator() {
    return this.priv.beginIterator();
  }

  // Finds an iterator pointing to the `null` value.
  endIterator() {
    return this.priv.endIterator();
  }

};

export default AbstractSortedSet;

