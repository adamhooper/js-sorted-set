require('./test_helper')
SortedSet = require('../src/SortedSet')

numberCompare = (a, b) -> a - b

describe 'SortedSet', ->
  it 'should have a RedBlackTreeStrategy', ->
    expect(SortedSet.RedBlackTreeStrategy).to.exist

  it 'should have a BinaryTreeStrategy', ->
    expect(SortedSet.BinaryTreeStrategy).to.exist

  it 'should have an ArrayStrategy', ->
    expect(SortedSet.ArrayStrategy).to.exist

  it 'should default to RedBlackTreeStrategy', ->
    set = new SortedSet(comparator: numberCompare)
    expect(set.priv.constructor).to.eq(SortedSet.RedBlackTreeStrategy)

  it 'should set a default comparator', ->
    set = new SortedSet(strategy: SortedSet.RedBlackTreeStrategy)
    expect(set.priv.comparator(2, 3)).to.eq(-1)

describe 'integration tests', ->
  set = undefined

  beforeEach -> set = new SortedSet()

  it 'should stay sorted', ->
    set.insert(1)
    set.insert(3)
    set.insert(2)
    expect(set.toArray()).to.deep.eq([1, 2, 3])

  it 'should remove', ->
    set.insert(1)
    set.insert(2)
    set.remove(2)
    expect(set.toArray()).to.deep.eq([1])

  it 'should map', ->
    set.insert(1)
    set.insert(2)
    expect(set.map((v) -> v * 2)).to.deep.eq([2, 4])

  it 'should iterate', ->
    set.insert(1)
    set.insert(2)
    iterator = set.beginIterator()
    expect(iterator.value()).to.eq(1)
    iterator = iterator.next()
    expect(iterator.value()).to.eq(2)
    iterator = iterator.next()
    expect(iterator.value()).to.eq(null)
    iterator = iterator.next()
    expect(iterator).to.eq(null)
