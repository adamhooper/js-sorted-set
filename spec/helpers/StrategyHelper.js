(function() {
  window.StrategyHelper = (function() {
    var numberComparator;
    numberComparator = function(a, b) {
      return a - b;
    };
    return {
      describeStrategy: function(description, strategy) {
        return describe(description, function() {
          var priv;
          priv = void 0;
          describe('starting empty', function() {
            beforeEach(function() {
              return priv = new strategy({
                comparator: numberComparator
              });
            });
            it('should not contain a value', function() {
              return expect(priv.contains(2)).toEqual(false);
            });
            it('should store its data in an array for easy testing', function() {
              return expect(priv.toArray()).toEqual([]);
            });
            it('should insert an element', function() {
              priv.insert(4);
              return expect(priv.toArray()).toEqual([4]);
            });
            it('should fail to remove an element', function() {
              return expect(function() {
                return priv.remove(4);
              }).toThrow('Value not in set');
            });
            it('should return an iterator with no next or previous', function() {
              var iterator;
              iterator = priv.findIterator(4);
              expect(iterator.hasNext()).toEqual(false);
              expect(iterator.hasPrevious()).toEqual(false);
              expect(iterator.next()).toEqual(null);
              expect(iterator.previous()).toEqual(null);
              return expect(iterator.value()).toEqual(null);
            });
            it('should return a beginIterator', function() {
              var iterator;
              iterator = priv.beginIterator();
              return expect(iterator.value()).toEqual(null);
            });
            it('should return an endIterator', function() {
              var iterator;
              iterator = priv.endIterator();
              return expect(iterator.value()).toEqual(null);
            });
            return it('should do nothing in forEachImpl()', function() {
              var callback;
              callback = jasmine.createSpy();
              priv.forEachImpl(callback);
              return expect(callback).not.toHaveBeenCalled();
            });
          });
          describe('with some numbers', function() {
            beforeEach(function() {
              priv = new strategy({
                comparator: numberComparator
              });
              priv.insert(2);
              priv.insert(1);
              return priv.insert(3);
            });
            it('should insert at the beginning', function() {
              priv.insert(0);
              return expect(priv.toArray()).toEqual([0, 1, 2, 3]);
            });
            it('should insert in the middle', function() {
              priv.insert(2.5);
              return expect(priv.toArray()).toEqual([1, 2, 2.5, 3]);
            });
            it('should insert at the end', function() {
              priv.insert(4);
              return expect(priv.toArray()).toEqual([1, 2, 3, 4]);
            });
            it('should remove from the beginning', function() {
              priv.remove(1);
              return expect(priv.toArray()).toEqual([2, 3]);
            });
            it('should remove from the end', function() {
              priv.remove(3);
              return expect(priv.toArray()).toEqual([1, 2]);
            });
            it('should remove from the middle', function() {
              priv.remove(2);
              return expect(priv.toArray()).toEqual([1, 3]);
            });
            it('should return true from contain', function() {
              return expect(priv.contains(2)).toBe(true);
            });
            it('should return false from contain', function() {
              return expect(priv.contains(4)).toBe(false);
            });
            it('should return a begin iterator', function() {
              var iterator;
              iterator = priv.beginIterator();
              expect(iterator.previous()).toEqual(null);
              return expect(iterator.value()).toEqual(1);
            });
            it('should return an end iterator', function() {
              var iterator;
              iterator = priv.endIterator();
              expect(iterator.next()).toEqual(null);
              return expect(iterator.value()).toEqual(null);
            });
            it('should find an iterator', function() {
              var iterator;
              iterator = priv.findIterator(2);
              return expect(iterator.value()).toEqual(2);
            });
            it('should find an iterator between values', function() {
              var iterator;
              iterator = priv.findIterator(1.5);
              return expect(iterator.value()).toEqual(2);
            });
            it('should find an iterator with a value above the max', function() {
              var iterator;
              iterator = priv.findIterator(3.5);
              return expect(iterator.value()).toEqual(null);
            });
            it('should find an iterator with a value below the min', function() {
              var iterator;
              iterator = priv.findIterator(0.5);
              return expect(iterator.value()).toEqual(1);
            });
            it('should find a previous iterator', function() {
              var iterator;
              iterator = priv.findIterator(2).previous();
              return expect(iterator.value()).toEqual(1);
            });
            it('should find a next iterator', function() {
              var iterator;
              iterator = priv.findIterator(2).next();
              return expect(iterator.value()).toEqual(3);
            });
            it('should step to previous from the end iterator', function() {
              var iterator;
              iterator = priv.endIterator().previous();
              return expect(iterator.value()).toEqual(3);
            });
            it('should step to end from a previous iterator', function() {
              var iterator;
              iterator = priv.findIterator(3).next();
              return expect(iterator.value()).toBe(null);
            });
            it('should fail to setValue()', function() {
              var iterator;
              iterator = priv.findIterator(2);
              return expect(function() {
                return iterator.setValue(2.5);
              }).toThrow();
            });
            return it('should iterate in forEachImpl', function() {
              var set, spy, thisArg;
              set = 'foo';
              thisArg = 'moo';
              spy = jasmine.createSpy();
              priv.forEachImpl(spy, set, thisArg);
              expect(spy.calls.length).toEqual(3);
              expect(spy.calls[0].object).toEqual(thisArg);
              expect(spy.calls[0].args).toEqual([1, 0, set]);
              expect(spy.calls[1].args).toEqual([2, 1, set]);
              return expect(spy.calls[2].args).toEqual([3, 2, set]);
            });
          });
          return describe('with allowSetValue', function() {
            beforeEach(function() {
              priv = new strategy({
                comparator: numberComparator,
                allowSetValue: true
              });
              priv.insert(1);
              return priv.insert(2);
            });
            it('should allow you to use setValue(), even to do something stupid', function() {
              var iterator;
              iterator = priv.findIterator(2);
              iterator.setValue(0);
              return expect(priv.toArray()).toEqual([1, 0]);
            });
            return it('should not allow setValue() on an end iterator', function() {
              var iterator;
              iterator = priv.endIterator();
              return expect(function() {
                return iterator.setValue(2.5);
              }).toThrow();
            });
          });
        });
      }
    };
  })();

}).call(this);
