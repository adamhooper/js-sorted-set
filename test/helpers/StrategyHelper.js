
const SortedSet = require('../../lib/SortedSet');

const numberComparator = (a, b) => {
  return a - b;
};

const describeStrategy = (description, strategy) => {
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
        return expect(priv.contains(2)).to.eq(false);
      });
      it('should store its data in an array for easy testing', function() {
        return expect(priv.toArray()).to.deep.eq([]);
      });
      it('should insert an element', function() {
        priv.insert(4);
        return expect(priv.toArray()).to.deep.eq([4]);
      });
      it('should fail to remove an element', function() {
        return expect(function() {
          return priv.remove(4);
        }).to.throw('Value not in set');
      });
      it('should return an iterator with no next or previous', function() {
        var iterator;
        iterator = priv.findIterator(4);
        expect(iterator.hasNext()).to.eq(false);
        expect(iterator.hasPrevious()).to.eq(false);
        expect(iterator.next()).to.eq(null);
        expect(iterator.previous()).to.eq(null);
        return expect(iterator.value()).to.eq(null);
      });
      it('should return a beginIterator', function() {
        var iterator;
        iterator = priv.beginIterator();
        return expect(iterator.value()).to.eq(null);
      });
      it('should return an endIterator', function() {
        var iterator;
        iterator = priv.endIterator();
        return expect(iterator.value()).to.eq(null);
      });
      return it('should do nothing in forEachImpl()', function() {
        var callback;
        callback = sinon.spy();
        priv.forEachImpl(callback);
        return expect(callback).not.to.have.been.called;
      });
    });
    describe('with some numbers', function() {
      beforeEach(function() {
        priv = new strategy({
          comparator: numberComparator
        });
        // Insert in this order so binary tree isn't one-sided
        priv.insert(2);
        priv.insert(1);
        return priv.insert(3);
      });
      it('should insert at the beginning', function() {
        priv.insert(0);
        return expect(priv.toArray()).to.deep.eq([0, 1, 2, 3]);
      });
      it('should insert in the middle', function() {
        priv.insert(2.5);
        return expect(priv.toArray()).to.deep.eq([1, 2, 2.5, 3]);
      });
      it('should insert at the end', function() {
        priv.insert(4);
        return expect(priv.toArray()).to.deep.eq([1, 2, 3, 4]);
      });
      it('should remove from the beginning', function() {
        priv.remove(1);
        return expect(priv.toArray()).to.deep.eq([2, 3]);
      });
      it('should remove from the end', function() {
        priv.remove(3);
        return expect(priv.toArray()).to.deep.eq([1, 2]);
      });
      it('should remove from the middle', function() {
        priv.remove(2);
        return expect(priv.toArray()).to.deep.eq([1, 3]);
      });
      it('should clear', function() {
        priv.clear();
        return expect(priv.toArray()).to.deep.eq([]);
      });
      it('should allow insert after clear', function() {
        priv.clear();
        priv.insert(4);
        priv.insert(2);
        return expect(priv.toArray()).to.deep.eq([2, 4]);
      });
      it('should contain the first value', function() {
        return expect(priv.contains(1)).to.eq(true);
      });
      it('should contain the last value', function() {
        return expect(priv.contains(3)).to.eq(true);
      });
      it('should contain a middle value', function() {
        return expect(priv.contains(2)).to.eq(true);
      });
      it('should not contain a value below the lowest', function() {
        return expect(priv.contains(0)).to.eq(false);
      });
      it('should not contain a value above the highest', function() {
        return expect(priv.contains(4)).to.eq(false);
      });
      it('should not contain a value in between two values', function() {
        return expect(priv.contains(1.5)).to.eq(false);
      });
      it('should return false from contain', function() {
        return expect(priv.contains(4)).to.eq(false);
      });
      it('should return a begin iterator', function() {
        var iterator;
        iterator = priv.beginIterator();
        expect(iterator.previous()).to.eq(null);
        return expect(iterator.value()).to.eq(1);
      });
      it('should return an end iterator', function() {
        var iterator;
        iterator = priv.endIterator();
        expect(iterator.next()).to.eq(null);
        return expect(iterator.value()).to.eq(null);
      });
      it('should find an iterator', function() {
        var iterator;
        iterator = priv.findIterator(2);
        return expect(iterator.value()).to.eq(2);
      });
      it('should find an iterator between values', function() {
        var iterator;
        iterator = priv.findIterator(1.5);
        return expect(iterator.value()).to.eq(2);
      });
      it('should find an iterator with a value above the max', function() {
        var iterator;
        iterator = priv.findIterator(3.5);
        return expect(iterator.value()).to.eq(null);
      });
      it('should find an iterator with a value below the min', function() {
        var iterator;
        iterator = priv.findIterator(0.5);
        return expect(iterator.value()).to.eq(1);
      });
      it('should find a previous iterator', function() {
        var iterator;
        iterator = priv.findIterator(2).previous();
        return expect(iterator.value()).to.eq(1);
      });
      it('should find a next iterator', function() {
        var iterator;
        iterator = priv.findIterator(2).next();
        return expect(iterator.value()).to.eq(3);
      });
      it('should step to previous from the end iterator', function() {
        var iterator;
        iterator = priv.endIterator().previous();
        return expect(iterator.value()).to.eq(3);
      });
      it('should step to end from a previous iterator', function() {
        var iterator;
        iterator = priv.findIterator(3).next();
        return expect(iterator.value()).to.eq(null);
      });
      it('should fail to setValue()', function() {
        var iterator;
        iterator = priv.findIterator(2);
        return expect(function() {
          return iterator.setValue(2.5);
        }).to.throw();
      });
      return it('should iterate in forEachImpl', function() {
        var set, spy, thisArg;
        set = 'foo';
        thisArg = 'moo';
        spy = sinon.spy();
        priv.forEachImpl(spy, set, thisArg);
        expect(spy).to.have.callCount(3);
        expect(spy.thisValues[0]).to.eq(thisArg);
        expect(spy.args[0]).to.deep.eq([1, 0, set]);
        expect(spy.args[1]).to.deep.eq([2, 1, set]);
        return expect(spy.args[2]).to.deep.eq([3, 2, set]);
      });
    });
    describe('with allowSetValue', function() {
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
        return expect(priv.toArray()).to.deep.eq([1, 0]);
      });
      return it('should not allow setValue() on an end iterator', function() {
        var iterator;
        iterator = priv.endIterator();
        return expect(function() {
          return iterator.setValue(2.5);
        }).to.throw();
      });
    });
    describe('with throw behavior on insert conflict', function() {
      beforeEach(function() {
        var comparator, onInsertConflict;
        comparator = function(a, b) {
          return a.v - b.v;
        };
        onInsertConflict = SortedSet.OnInsertConflictThrow;
        priv = new strategy({comparator, onInsertConflict});
        priv.insert({
          v: 1,
          q: 'a'
        });
        return priv.insert({
          v: 2,
          q: 'b'
        });
      });
      return it('should throw when inserting an element that matches another', function() {
        var err;
        return expect(() => priv.insert({ v: 1, q: 'c' })).to.throw('Value already in set');
      });
    });
    describe('with replace behavior on insert conflict', function() {
      beforeEach(function() {
        var comparator, onInsertConflict;
        comparator = function(a, b) {
          return a.v - b.v;
        };
        onInsertConflict = SortedSet.OnInsertConflictReplace;
        priv = new strategy({comparator, onInsertConflict});
        priv.insert({
          v: 1,
          q: 'a'
        });
        return priv.insert({
          v: 2,
          q: 'b'
        });
      });
      return it('should replace a matching element with the new element', function() {
        priv.insert({
          v: 1,
          q: 'c'
        });
        return expect(priv.toArray()).to.deep.eq([
          {
            v: 1,
            q: 'c'
          },
          {
            v: 2,
            q: 'b'
          }
        ]);
      });
    });
    return describe('with ignore behavior on insert conflict', function() {
      beforeEach(function() {
        var comparator, onInsertConflict;
        comparator = function(a, b) {
          return a.v - b.v;
        };
        onInsertConflict = SortedSet.OnInsertConflictIgnore;
        priv = new strategy({comparator, onInsertConflict});
        priv.insert({
          v: 1,
          q: 'a'
        });
        return priv.insert({
          v: 2,
          q: 'b'
        });
      });
      return it('should ignore the new element when inserting an element that matches another ', function() {
        priv.insert({
          v: 1,
          q: 'c'
        });
        return expect(priv.toArray()).to.deep.eq([
          {
            v: 1,
            q: 'a'
          },
          {
            v: 2,
            q: 'b'
          }
        ]);
      });
    });
  });
}

module.exports.describeStrategy = describeStrategy;
