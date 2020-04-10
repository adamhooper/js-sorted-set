
require('../test_helper');
const SortedSet = require('../../lib/SortedSet');
const AbstractSortedSet = require('../../lib/SortedSet/AbstractSortedSet');

const numberCompare = function(a, b) {
  return a - b;
};

describe('AbstractSortedSet', function() {
  it('should throw if there is no strategy', function() {
    return expect(function() {
      return new AbstractSortedSet({
        comparator: numberCompare
      });
    }).to.throw();
  });
  it('should throw if there is no comparator', function() {
    return expect(function() {
      return new AbstractSortedSet({
        strategy: (function() {})
      });
    }).to.throw();
  });
  return describe('with a set', function() {
    var MockStrategy, set, strategy;
    strategy = null;
    set = null;
    MockStrategy = (function() {
      class MockStrategy {
        constructor(options) {
          this.options = options;
          strategy = this;
        }

      };

      MockStrategy.prototype.insert = sinon.spy();

      MockStrategy.prototype.remove = sinon.spy();

      MockStrategy.prototype.clear = sinon.spy();

      MockStrategy.prototype.toArray = sinon.stub().returns([]);

      MockStrategy.prototype.forEachImpl = sinon.stub();

      MockStrategy.prototype.findIterator = sinon.stub();

      MockStrategy.prototype.beginIterator = sinon.stub();

      MockStrategy.prototype.endIterator = sinon.stub();

      return MockStrategy;

    }).call(this);
    beforeEach(function() {
      return set = new AbstractSortedSet({
        comparator: numberCompare,
        strategy: MockStrategy,
        onInsertConflict: SortedSet.OnInsertConflictThrow,
      });
    });
    it('should pass the options to the strategy', function() {
      return expect(strategy.options.comparator).to.eq(numberCompare);
    });
    it('should start with length 0', function() {
      return expect(set.length).to.eq(0);
    });
    it('should call strategy.insert', function() {
      set.insert(1);
      return expect(strategy.insert).to.have.been.calledWith(1);
    });
    it('should increment length on insert', function() {
      set.insert(1);
      return expect(set.length).to.eq(1);
    });
    it('should call strategy.remove', function() {
      set.remove(1);
      return expect(strategy.remove).to.have.been.calledWith(1);
    });
    it('should decrement length on remove', function() {
      set.insert(1);
      set.remove(1);
      return expect(set.length).to.eq(0);
    });
    it('should call strategy.clear', function() {
      set.clear();
      return expect(strategy.clear).to.have.been.called;
    });
    it('should set length=0 on clear', function() {
      set.insert(1);
      set.clear();
      return expect(set.length).to.eq(0);
    });
    it('should call toArray', function() {
      strategy.toArray.returns([1, 2, 3]);
      return expect(set.toArray()).to.deep.eq([1, 2, 3]);
    });
    it('should call findIterator with the value', function() {
      var expected, ret;
      expected = {};
      strategy.findIterator.returns(expected);
      ret = set.findIterator(expected);
      expect(strategy.findIterator).to.have.been.calledWith(expected);
      return expect(ret).to.eq(expected);
    });
    it('should call beginIterator', function() {
      var expected, ret;
      expected = {};
      strategy.beginIterator.returns(expected);
      ret = set.beginIterator();
      expect(strategy.beginIterator).to.have.been.called;
      return expect(ret).to.eq(expected);
    });
    it('should call endIterator', function() {
      var expected, ret;
      expected = {};
      strategy.endIterator.returns(expected);
      ret = set.endIterator();
      expect(strategy.endIterator).to.have.been.called;
      return expect(ret).to.eq(expected);
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
          var spy;
          spy = sinon.spy();
          set.forEach(spy);
          expect(spy).to.have.callCount(3);
          expect(spy.thisValues[0]).to.be.undefined;
          expect(spy.args[0][0]).to.eq(1);
          expect(spy.args[0][1]).to.eq(0);
          expect(spy.args[0][2]).to.eq(set);
          expect(spy.args[1][1]).to.eq(1);
          return expect(spy.args[2][1]).to.eq(2);
        });
        return it('should set thisArg', function() {
          var callback, thisArg;
          callback = sinon.spy();
          thisArg = {};
          set.forEach(callback, thisArg);
          return expect(callback.thisValues[0]).to.eq(thisArg);
        });
      });
      describe('map', function() {
        return it('should map', function() {
          var ret;
          ret = set.map(function(value) {
            return value * 2;
          });
          return expect(ret).to.deep.eq([2, 4, 6]);
        });
      });
      describe('filter', function() {
        return it('should filter', function() {
          var ret;
          ret = set.filter(function(value) {
            return value !== 2;
          });
          return expect(ret).to.deep.eq([1, 3]);
        });
      });
      describe('every', function() {
        it('should return true', function() {
          var ret;
          ret = set.every(function(value) {
            return value > 0;
          });
          return expect(ret).to.eq(true);
        });
        return it('should return false', function() {
          var ret;
          ret = set.every(function(value) {
            return value > 1;
          });
          return expect(ret).to.eq(false);
        });
      });
      return describe('some', function() {
        it('should return true', function() {
          var ret;
          ret = set.some(function(value) {
            return value > 2;
          });
          return expect(ret).to.eq(true);
        });
        return it('should return false', function() {
          var ret;
          ret = set.some(function(value) {
            return value > 3;
          });
          return expect(ret).to.eq(false);
        });
      });
    });
  });
});

