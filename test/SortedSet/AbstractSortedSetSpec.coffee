require('../test_helper')
insertConflictResolvers = require('../../dist/insertConflictResolvers')
AbstractSortedSet = require('../../dist/SortedSet/AbstractSortedSet')

numberCompare = (a, b) -> a - b

describe 'AbstractSortedSet', ->
  it 'should throw if there is no strategy', ->
    expect(-> new AbstractSortedSet(comparator: numberCompare)).to.throw()

  it 'should throw if there is no comparator', ->
    expect(-> new AbstractSortedSet(strategy: (->))).to.throw()

  describe 'with a set', ->
    strategy = null
    set = null

    class MockStrategy
      constructor: (@options) ->
        strategy = this
      insert: sinon.spy()
      remove: sinon.spy()
      clear: sinon.spy()
      toArray: sinon.stub().returns([])
      forEachImpl: sinon.stub()
      findIterator: sinon.stub()
      beginIterator: sinon.stub()
      endIterator: sinon.stub()

    beforeEach ->
      set = new AbstractSortedSet
        comparator: numberCompare
        strategy: MockStrategy
        onInsertConflict: insertConflictResolvers.throw

    it 'should pass the options to the strategy', ->
      expect(strategy.options.comparator).to.eq(numberCompare)

    it 'should start with length 0', ->
      expect(set.length).to.eq(0)

    it 'should call strategy.insert', ->
      set.insert(1)
      expect(strategy.insert).to.have.been.calledWith(1)

    it 'should increment length on insert', ->
      set.insert(1)
      expect(set.length).to.eq(1)

    it 'should call strategy.remove', ->
      set.remove(1)
      expect(strategy.remove).to.have.been.calledWith(1)

    it 'should decrement length on remove', ->
      set.insert(1)
      set.remove(1)
      expect(set.length).to.eq(0)

    it 'should call strategy.clear', ->
      set.clear()
      expect(strategy.clear).to.have.been.called

    it 'should set length=0 on clear', ->
      set.insert(1)
      set.clear()
      expect(set.length).to.eq(0)

    it 'should call toArray', ->
      strategy.toArray.returns([1, 2, 3])
      expect(set.toArray()).to.deep.eq([1, 2, 3])

    it 'should call findIterator with the value', ->
      expected = {}
      strategy.findIterator.returns(expected)
      ret = set.findIterator(expected)
      expect(strategy.findIterator).to.have.been.calledWith(expected)
      expect(ret).to.eq(expected)

    it 'should call beginIterator', ->
      expected = {}
      strategy.beginIterator.returns(expected)
      ret = set.beginIterator()
      expect(strategy.beginIterator).to.have.been.called
      expect(ret).to.eq(expected)

    it 'should call endIterator', ->
      expected = {}
      strategy.endIterator.returns(expected)
      ret = set.endIterator()
      expect(strategy.endIterator).to.have.been.called
      expect(ret).to.eq(expected)

    describe 'with forEachImpl calling a callback three times', ->
      beforeEach ->
        strategy.forEachImpl = (callback, selfArg, thisArg) ->
          callback.call(thisArg, 1, 0, selfArg)
          callback.call(thisArg, 2, 1, selfArg)
          callback.call(thisArg, 3, 2, selfArg)

      describe 'forEach', ->
        it 'should work with no extra arguments', ->
          spy = sinon.spy()
          set.forEach(spy)
          expect(spy).to.have.callCount(3)
          expect(spy.thisValues[0]).to.be.undefined
          expect(spy.args[0][0]).to.eq(1)
          expect(spy.args[0][1]).to.eq(0)
          expect(spy.args[0][2]).to.eq(set)
          expect(spy.args[1][1]).to.eq(1)
          expect(spy.args[2][1]).to.eq(2)

        it 'should set thisArg', ->
          callback = sinon.spy()
          thisArg = {}
          set.forEach(callback, thisArg)
          expect(callback.thisValues[0]).to.eq(thisArg)

      describe 'map', ->
        it 'should map', ->
          ret = set.map((value) -> value * 2)
          expect(ret).to.deep.eq([2, 4, 6])

      describe 'filter', ->
        it 'should filter', ->
          ret = set.filter((value) -> value != 2)
          expect(ret).to.deep.eq([1, 3])

      describe 'every', ->
        it 'should return true', ->
          ret = set.every((value) -> value > 0)
          expect(ret).to.eq(true)

        it 'should return false', ->
          ret = set.every((value) -> value > 1)
          expect(ret).to.eq(false)

      describe 'some', ->
        it 'should return true', ->
          ret = set.some((value) -> value > 2)
          expect(ret).to.eq(true)

        it 'should return false', ->
          ret = set.some((value) -> value > 3)
          expect(ret).to.eq(false)
