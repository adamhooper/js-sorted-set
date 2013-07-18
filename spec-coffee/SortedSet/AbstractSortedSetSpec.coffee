define [ 'SortedSet/AbstractSortedSet' ], (AbstractSortedSet) ->
  numberCompare = (a, b) -> a - b

  describe 'AbstractSortedSet', ->
    it 'should throw if there is no strategy', ->
      expect(-> new AbstractSortedSet(comparator: numberCompare)).toThrow()

    it 'should throw if there is no comparator', ->
      expect(-> new AbstractSortedSet(strategy: (->))).toThrow()

    describe 'with a set', ->
      set = undefined
      strategy = undefined

      class MockStrategy
        constructor: (@options) ->
          strategy = this
        insert: ->
        remove: ->
        toArray: -> []
        forEachImpl: ->
        findIterator: ->
        beginIterator: ->
        endIterator: ->

      beforeEach ->
        set = new AbstractSortedSet
          comparator: numberCompare
          strategy: MockStrategy

      it 'should pass the options to the strategy', ->
        expect(strategy.options.comparator).toEqual(numberCompare)

      it 'should call strategy.insert', ->
        strategy.insert = jasmine.createSpy()
        set.insert(1)
        expect(strategy.insert).toHaveBeenCalledWith(1)

      it 'should call strategy.remove', ->
        strategy.remove = jasmine.createSpy()
        set.remove(1)
        expect(strategy.remove).toHaveBeenCalledWith(1)

      it 'should call toArray', ->
        strategy.toArray = jasmine.createSpy().andReturn([1, 2, 3])
        expect(set.toArray()).toEqual([1, 2, 3])

      it 'should call findIterator with the value', ->
        expected = {}
        strategy.findIterator = jasmine.createSpy().andReturn(expected)
        ret = set.findIterator(expected)
        expect(strategy.findIterator).toHaveBeenCalledWith(expected)
        expect(ret).toBe(expected)

      it 'should call beginIterator', ->
        expected = {}
        strategy.beginIterator = jasmine.createSpy().andReturn(expected)
        ret = set.beginIterator()
        expect(strategy.beginIterator).toHaveBeenCalled()
        expect(ret).toBe(expected)

      it 'should call endIterator', ->
        expected = {}
        strategy.endIterator = jasmine.createSpy().andReturn(expected)
        ret = set.endIterator()
        expect(strategy.endIterator).toHaveBeenCalled()
        expect(ret).toBe(expected)

      describe 'with forEachImpl calling a callback three times', ->
        beforeEach ->
          strategy.forEachImpl = (callback, selfArg, thisArg) ->
            callback.call(thisArg, 1, 0, selfArg)
            callback.call(thisArg, 2, 1, selfArg)
            callback.call(thisArg, 3, 2, selfArg)

        describe 'forEach', ->
          it 'should work with no extra arguments', ->
            callback = jasmine.createSpy()
            set.forEach(callback)
            expect(callback.calls.length).toEqual(3)
            expect(callback.calls[0].object).toBe(window)
            expect(callback.calls[0].args[0]).toEqual(1)
            expect(callback.calls[0].args[1]).toEqual(0)
            expect(callback.calls[0].args[2]).toBe(set)
            expect(callback.calls[1].args[1]).toEqual(1)
            expect(callback.calls[2].args[1]).toEqual(2)

          it 'should set thisArg', ->
            callback = jasmine.createSpy()
            thisArg = {}
            set.forEach(callback, thisArg)
            expect(callback.calls[0].object).toBe(thisArg)

        describe 'map', ->
          it 'should map', ->
            ret = set.map((value) -> value * 2)
            expect(ret).toEqual([2, 4, 6])

        describe 'filter', ->
          it 'should filter', ->
            ret = set.filter((value) -> value != 2)
            expect(ret).toEqual([1, 3])

        describe 'every', ->
          it 'should return true', ->
            ret = set.every((value) -> value > 0)
            expect(ret).toBe(true)

          it 'should return false', ->
            ret = set.every((value) -> value > 1)
            expect(ret).toBe(false)

        describe 'some', ->
          it 'should return true', ->
            ret = set.some((value) -> value > 2)
            expect(ret).toBe(true)

          it 'should return false', ->
            ret = set.some((value) -> value > 3)
            expect(ret).toBe(false)
