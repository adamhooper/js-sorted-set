(function() {
  define(['SortedSet/AbstractSortedSet'], function(AbstractSortedSet) {
    var numberCompare;
    numberCompare = function(a, b) {
      return a - b;
    };
    return describe('AbstractSortedSet', function() {
      it('should throw if there is no strategy', function() {
        return expect(function() {
          return new AbstractSortedSet({
            comparator: numberCompare
          });
        }).toThrow();
      });
      it('should throw if there is no comparator', function() {
        return expect(function() {
          return new AbstractSortedSet({
            strategy: (function() {})
          });
        }).toThrow();
      });
      return describe('with a set', function() {
        var MockStrategy, set, strategy;
        set = void 0;
        strategy = void 0;
        MockStrategy = (function() {
          function MockStrategy(options) {
            this.options = options;
            strategy = this;
          }

          MockStrategy.prototype.insert = function() {};

          MockStrategy.prototype.remove = function() {};

          MockStrategy.prototype.toArray = function() {
            return [];
          };

          MockStrategy.prototype.forEachImpl = function() {};

          MockStrategy.prototype.findIterator = function() {};

          MockStrategy.prototype.beginIterator = function() {};

          MockStrategy.prototype.endIterator = function() {};

          return MockStrategy;

        })();
        beforeEach(function() {
          return set = new AbstractSortedSet({
            comparator: numberCompare,
            strategy: MockStrategy
          });
        });
        it('should pass the options to the strategy', function() {
          return expect(strategy.options.comparator).toEqual(numberCompare);
        });
        it('should call strategy.insert', function() {
          strategy.insert = jasmine.createSpy();
          set.insert(1);
          return expect(strategy.insert).toHaveBeenCalledWith(1);
        });
        it('should call strategy.remove', function() {
          strategy.remove = jasmine.createSpy();
          set.remove(1);
          return expect(strategy.remove).toHaveBeenCalledWith(1);
        });
        it('should call toArray', function() {
          strategy.toArray = jasmine.createSpy().andReturn([1, 2, 3]);
          return expect(set.toArray()).toEqual([1, 2, 3]);
        });
        it('should call findIterator with the value', function() {
          var expected, ret;
          expected = {};
          strategy.findIterator = jasmine.createSpy().andReturn(expected);
          ret = set.findIterator(expected);
          expect(strategy.findIterator).toHaveBeenCalledWith(expected);
          return expect(ret).toBe(expected);
        });
        it('should call beginIterator', function() {
          var expected, ret;
          expected = {};
          strategy.beginIterator = jasmine.createSpy().andReturn(expected);
          ret = set.beginIterator();
          expect(strategy.beginIterator).toHaveBeenCalled();
          return expect(ret).toBe(expected);
        });
        it('should call endIterator', function() {
          var expected, ret;
          expected = {};
          strategy.endIterator = jasmine.createSpy().andReturn(expected);
          ret = set.endIterator();
          expect(strategy.endIterator).toHaveBeenCalled();
          return expect(ret).toBe(expected);
        });
        return describe('with forEachImpl calling a callback three times', function() {
          beforeEach(function() {
            return strategy.forEachImpl = function(callback, selfArg, thisArg) {
              callback.call(thisArg, 1, 0, selfArg);
              callback.call(thisArg, 2, 1, selfArg);
              return callback.call(thisArg, 3, 2, selfArg);
            };
          });
          describe('forEach', function() {
            it('should work with no extra arguments', function() {
              var callback;
              callback = jasmine.createSpy();
              set.forEach(callback);
              expect(callback.calls.length).toEqual(3);
              expect(callback.calls[0].object).toBe(window);
              expect(callback.calls[0].args[0]).toEqual(1);
              expect(callback.calls[0].args[1]).toEqual(0);
              expect(callback.calls[0].args[2]).toBe(set);
              expect(callback.calls[1].args[1]).toEqual(1);
              return expect(callback.calls[2].args[1]).toEqual(2);
            });
            return it('should set thisArg', function() {
              var callback, thisArg;
              callback = jasmine.createSpy();
              thisArg = {};
              set.forEach(callback, thisArg);
              return expect(callback.calls[0].object).toBe(thisArg);
            });
          });
          describe('map', function() {
            return it('should map', function() {
              var ret;
              ret = set.map(function(value) {
                return value * 2;
              });
              return expect(ret).toEqual([2, 4, 6]);
            });
          });
          describe('filter', function() {
            return it('should filter', function() {
              var ret;
              ret = set.filter(function(value) {
                return value !== 2;
              });
              return expect(ret).toEqual([1, 3]);
            });
          });
          describe('every', function() {
            it('should return true', function() {
              var ret;
              ret = set.every(function(value) {
                return value > 0;
              });
              return expect(ret).toBe(true);
            });
            return it('should return false', function() {
              var ret;
              ret = set.every(function(value) {
                return value > 1;
              });
              return expect(ret).toBe(false);
            });
          });
          return describe('some', function() {
            it('should return true', function() {
              var ret;
              ret = set.some(function(value) {
                return value > 2;
              });
              return expect(ret).toBe(true);
            });
            return it('should return false', function() {
              var ret;
              ret = set.some(function(value) {
                return value > 3;
              });
              return expect(ret).toBe(false);
            });
          });
        });
      });
    });
  });

}).call(this);
