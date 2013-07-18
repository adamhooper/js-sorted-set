(function() {
  define(function() {
    var ArrayStrategy, Iterator, binarySearchForIndex;
    Iterator = function(priv, index) {
      var data;
      data = priv.data;
      return {
        hasNext: function() {
          return index < data.length;
        },
        hasPrevious: function() {
          return index > 0;
        },
        value: function() {
          if (index < data.length) {
            return data[index];
          } else {
            return null;
          }
        },
        setValue: function(value) {
          if (!priv.options.allowSetValue) {
            throw 'Must set options.allowSetValue';
          }
          if (!this.hasNext()) {
            throw 'Cannot set value at end of set';
          }
          return data[index] = value;
        },
        next: function() {
          if (index >= data.length) {
            return null;
          } else {
            return new Iterator(priv, index + 1);
          }
        },
        previous: function() {
          if (index <= 0) {
            return null;
          } else {
            return new Iterator(priv, index - 1);
          }
        }
      };
    };
    binarySearchForIndex = function(array, value, comparator) {
      var high, low, mid;
      low = 0;
      high = array.length;
      while (low < high) {
        mid = (low + high) >>> 1;
        if (comparator(array[mid], value) < 0) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return low;
    };
    return ArrayStrategy = (function() {
      function ArrayStrategy(options) {
        this.options = options;
        this.comparator = this.options.comparator;
        this.data = [];
      }

      ArrayStrategy.prototype.toArray = function() {
        return this.data;
      };

      ArrayStrategy.prototype.insert = function(value) {
        var index;
        index = binarySearchForIndex(this.data, value, this.comparator);
        if (this.data[index] === value) {
          throw 'Value already in set';
        }
        return this.data.splice(index, 0, value);
      };

      ArrayStrategy.prototype.remove = function(value) {
        var index;
        index = binarySearchForIndex(this.data, value, this.comparator);
        if (this.data[index] !== value) {
          throw 'Value not in set';
        }
        return this.data.splice(index, 1);
      };

      ArrayStrategy.prototype.forEachImpl = function(callback, sortedSet, thisArg) {
        var index, value, _i, _len, _ref;
        _ref = this.data;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          value = _ref[index];
          callback.call(thisArg, value, index, sortedSet);
        }
        return void 0;
      };

      ArrayStrategy.prototype.findIterator = function(value) {
        var index;
        index = binarySearchForIndex(this.data, value, this.comparator);
        return new Iterator(this, index);
      };

      ArrayStrategy.prototype.beginIterator = function() {
        return new Iterator(this, 0);
      };

      ArrayStrategy.prototype.endIterator = function() {
        return new Iterator(this, this.data.length);
      };

      return ArrayStrategy;

    })();
  });

}).call(this);

/*
//@ sourceMappingURL=ArrayStrategy.js.map
*/