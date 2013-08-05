window.StrategyHelper = (->
  numberComparator = (a, b) -> a - b

  describeStrategy: (description, strategy) ->
    describe description, ->
      priv = undefined

      describe 'starting empty', ->
        beforeEach ->
          priv = new strategy(comparator: numberComparator)

        it 'should not contain a value', ->
          expect(priv.contains(2)).toEqual(false)

        it 'should store its data in an array for easy testing', ->
          expect(priv.toArray()).toEqual([])

        it 'should insert an element', ->
          priv.insert(4)
          expect(priv.toArray()).toEqual([4])

        it 'should fail to remove an element', ->
          expect(-> priv.remove(4)).toThrow('Value not in set')

        it 'should return an iterator with no next or previous', ->
          iterator = priv.findIterator(4)
          expect(iterator.hasNext()).toEqual(false)
          expect(iterator.hasPrevious()).toEqual(false)
          expect(iterator.next()).toEqual(null)
          expect(iterator.previous()).toEqual(null)
          expect(iterator.value()).toEqual(null)

        it 'should return a beginIterator', ->
          iterator = priv.beginIterator()
          expect(iterator.value()).toEqual(null)

        it 'should return an endIterator', ->
          iterator = priv.endIterator()
          expect(iterator.value()).toEqual(null)

        it 'should do nothing in forEachImpl()', ->
          callback = jasmine.createSpy()
          priv.forEachImpl(callback)
          expect(callback).not.toHaveBeenCalled()

      describe 'with some numbers', ->
        beforeEach ->
          priv = new strategy(comparator: numberComparator)
          # Insert in this order so binary tree isn't one-sided
          priv.insert(2)
          priv.insert(1)
          priv.insert(3)

        it 'should insert at the beginning', ->
          priv.insert(0)
          expect(priv.toArray()).toEqual([0, 1, 2, 3])

        it 'should insert in the middle', ->
          priv.insert(2.5)
          expect(priv.toArray()).toEqual([1, 2, 2.5, 3])

        it 'should insert at the end', ->
          priv.insert(4)
          expect(priv.toArray()).toEqual([1, 2, 3, 4])

        it 'should remove from the beginning', ->
          priv.remove(1)
          expect(priv.toArray()).toEqual([2, 3])

        it 'should remove from the end', ->
          priv.remove(3)
          expect(priv.toArray()).toEqual([1, 2])

        it 'should remove from the middle', ->
          priv.remove(2)
          expect(priv.toArray()).toEqual([1, 3])

        it 'should contain the first value', ->
          expect(priv.contains(1)).toBe(true)

        it 'should contain the last value', ->
          expect(priv.contains(3)).toBe(true)

        it 'should contain a middle value', ->
          expect(priv.contains(2)).toBe(true)

        it 'should not contain a value below the lowest', ->
          expect(priv.contains(0)).toBe(false)

        it 'should not contain a value above the highest', ->
          expect(priv.contains(4)).toBe(false)

        it 'should not contain a value in between two values', ->
          expect(priv.contains(1.5)).toBe(false)

        it 'should return false from contain', ->
          expect(priv.contains(4)).toBe(false)

        it 'should return a begin iterator', ->
          iterator = priv.beginIterator()
          expect(iterator.previous()).toEqual(null)
          expect(iterator.value()).toEqual(1)

        it 'should return an end iterator', ->
          iterator = priv.endIterator()
          expect(iterator.next()).toEqual(null)
          expect(iterator.value()).toEqual(null)

        it 'should find an iterator', ->
          iterator = priv.findIterator(2)
          expect(iterator.value()).toEqual(2)

        it 'should find an iterator between values', ->
          iterator = priv.findIterator(1.5)
          expect(iterator.value()).toEqual(2)

        it 'should find an iterator with a value above the max', ->
          iterator = priv.findIterator(3.5)
          expect(iterator.value()).toEqual(null)

        it 'should find an iterator with a value below the min', ->
          iterator = priv.findIterator(0.5)
          expect(iterator.value()).toEqual(1)

        it 'should find a previous iterator', ->
          iterator = priv.findIterator(2).previous()
          expect(iterator.value()).toEqual(1)

        it 'should find a next iterator', ->
          iterator = priv.findIterator(2).next()
          expect(iterator.value()).toEqual(3)

        it 'should step to previous from the end iterator', ->
          iterator = priv.endIterator().previous()
          expect(iterator.value()).toEqual(3)

        it 'should step to end from a previous iterator', ->
          iterator = priv.findIterator(3).next()
          expect(iterator.value()).toBe(null)

        it 'should fail to setValue()', ->
          iterator = priv.findIterator(2)
          expect(-> iterator.setValue(2.5)).toThrow()

        it 'should iterate in forEachImpl', ->
          set = 'foo'
          thisArg = 'moo'
          spy = jasmine.createSpy()
          priv.forEachImpl(spy, set, thisArg)
          expect(spy.calls.length).toEqual(3)
          expect(spy.calls[0].object).toEqual(thisArg)
          expect(spy.calls[0].args).toEqual([ 1, 0, set  ])
          expect(spy.calls[1].args).toEqual([ 2, 1, set  ])
          expect(spy.calls[2].args).toEqual([ 3, 2, set  ])

      describe 'with allowSetValue', ->
        beforeEach ->
          priv = new strategy(comparator: numberComparator, allowSetValue: true)
          priv.insert(1)
          priv.insert(2)

        it 'should allow you to use setValue(), even to do something stupid', ->
          iterator = priv.findIterator(2)
          iterator.setValue(0)
          expect(priv.toArray()).toEqual([1, 0])

        it 'should not allow setValue() on an end iterator', ->
          iterator = priv.endIterator()
          expect(-> iterator.setValue(2.5)).toThrow()
)()
