(function() {
  define(function() {
    var AbstractSortedSet;
    return AbstractSortedSet = (function() {
      function AbstractSortedSet(options) {
        if ((options != null ? options.strategy : void 0) == null) {
          throw 'Must pass options.strategy, a strategy';
        }
        if ((options != null ? options.comparator : void 0) == null) {
          throw 'Must pass options.comparator, a comparator';
        }
        this.priv = new options.strategy(options);
      }

      AbstractSortedSet.prototype.insert = function(value) {
        this.priv.insert(value);
        return this;
      };

      AbstractSortedSet.prototype.remove = function(value) {
        this.priv.remove(value);
        return this;
      };

      AbstractSortedSet.prototype.toArray = function() {
        return this.priv.toArray();
      };

      AbstractSortedSet.prototype.forEach = function(callback, thisArg) {
        this.priv.forEachImpl(callback, this, thisArg);
        return this;
      };

      AbstractSortedSet.prototype.map = function(callback, thisArg) {
        var ret;
        ret = [];
        this.forEach(function(value, index, self) {
          return ret.push(callback.call(thisArg, value, index, self));
        });
        return ret;
      };

      AbstractSortedSet.prototype.filter = function(callback, thisArg) {
        var ret;
        ret = [];
        this.forEach(function(value, index, self) {
          if (callback.call(thisArg, value, index, self)) {
            return ret.push(value);
          }
        });
        return ret;
      };

      AbstractSortedSet.prototype.every = function(callback, thisArg) {
        var ret;
        ret = true;
        this.forEach(function(value, index, self) {
          if (ret && !callback.call(thisArg, value, index, self)) {
            return ret = false;
          }
        });
        return ret;
      };

      AbstractSortedSet.prototype.some = function(callback, thisArg) {
        var ret;
        ret = false;
        this.forEach(function(value, index, self) {
          if (!ret && callback.call(thisArg, value, index, self)) {
            return ret = true;
          }
        });
        return ret;
      };

      AbstractSortedSet.prototype.findIterator = function(value) {
        return this.priv.findIterator(value);
      };

      AbstractSortedSet.prototype.beginIterator = function() {
        return this.priv.beginIterator();
      };

      AbstractSortedSet.prototype.endIterator = function() {
        return this.priv.endIterator();
      };

      return AbstractSortedSet;

    })();
  });

}).call(this);

/*
//@ sourceMappingURL=AbstractSortedSet.js.map
*/