require('./test_helper');
const SortedSet = require('../lib/SortedSet');

const numberCompare = (a, b) => {
  return a - b;
};

describe('SortedSet', function() {
  it('should have a RedBlackTreeStrategy', function() {
    return expect(SortedSet.RedBlackTreeStrategy).to.exist;
  });
  it('should have a BinaryTreeStrategy', function() {
    return expect(SortedSet.BinaryTreeStrategy).to.exist;
  });
  it('should have an ArrayStrategy', function() {
    return expect(SortedSet.ArrayStrategy).to.exist;
  });
  it('should default to RedBlackTreeStrategy', function() {
    var set;
    set = new SortedSet({
      comparator: numberCompare
    });
    return expect(set.priv.constructor).to.eq(SortedSet.RedBlackTreeStrategy);
  });
  return it('should set a default comparator', function() {
    var set;
    set = new SortedSet({
      strategy: SortedSet.RedBlackTreeStrategy
    });
    return expect(set.priv.comparator(2, 3)).to.eq(-1);
  });
});

describe('integration tests', function() {
  var set;
  set = void 0;
  beforeEach(function() {
    return set = new SortedSet();
  });
  it('should stay sorted', function() {
    set.insert(1);
    set.insert(3);
    set.insert(2);
    return expect(set.toArray()).to.deep.eq([1, 2, 3]);
  });
  it('should remove', function() {
    set.insert(1);
    set.insert(2);
    set.remove(2);
    return expect(set.toArray()).to.deep.eq([1]);
  });
  it('should map', function() {
    set.insert(1);
    set.insert(2);
    return expect(set.map(function(v) {
      return v * 2;
    })).to.deep.eq([2, 4]);
  });
  return it('should iterate', function() {
    var iterator;
    set.insert(1);
    set.insert(2);
    iterator = set.beginIterator();
    expect(iterator.value()).to.eq(1);
    iterator = iterator.next();
    expect(iterator.value()).to.eq(2);
    iterator = iterator.next();
    expect(iterator.value()).to.eq(null);
    iterator = iterator.next();
    return expect(iterator).to.eq(null);
  });
});
