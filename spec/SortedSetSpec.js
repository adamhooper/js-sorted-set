(function() {
  define(['SortedSet'], function(SortedSet) {
    var numberCompare;
    numberCompare = function(a, b) {
      return a - b;
    };
    describe('SortedSet', function() {
      it('should have a RedBlackTreeStrategy', function() {
        return expect(SortedSet.RedBlackTreeStrategy).toBeDefined();
      });
      it('should have a BinaryTreeStrategy', function() {
        return expect(SortedSet.BinaryTreeStrategy).toBeDefined();
      });
      it('should have an ArrayStrategy', function() {
        return expect(SortedSet.ArrayStrategy).toBeDefined();
      });
      it('should default to RedBlackTreeStrategy', function() {
        var set;
        set = new SortedSet({
          comparator: numberCompare
        });
        return expect(set.priv.constructor).toBe(SortedSet.RedBlackTreeStrategy);
      });
      return it('should set a default comparator', function() {
        var set;
        set = new SortedSet({
          strategy: SortedSet.RedBlackTreeStrategy
        });
        return expect(set.priv.comparator(2, 3)).toEqual(-1);
      });
    });
    return describe('integration tests', function() {
      var set;
      set = void 0;
      beforeEach(function() {
        return set = new SortedSet();
      });
      it('should stay sorted', function() {
        set.insert(1);
        set.insert(3);
        set.insert(2);
        return expect(set.toArray()).toEqual([1, 2, 3]);
      });
      it('should remove', function() {
        set.insert(1);
        set.insert(2);
        set.remove(2);
        return expect(set.toArray()).toEqual([1]);
      });
      it('should map', function() {
        set.insert(1);
        set.insert(2);
        return expect(set.map(function(v) {
          return v * 2;
        })).toEqual([2, 4]);
      });
      return it('should iterate', function() {
        var iterator;
        set.insert(1);
        set.insert(2);
        iterator = set.beginIterator();
        expect(iterator.value()).toEqual(1);
        iterator = iterator.next();
        expect(iterator.value()).toEqual(2);
        iterator = iterator.next();
        expect(iterator.value()).toBe(null);
        iterator = iterator.next();
        return expect(iterator).toBe(null);
      });
    });
  });

}).call(this);
