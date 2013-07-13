define [ 'SortedSet' ], (SortedSet) ->
  numberCompare = (a, b) -> a - b

  describe 'SortedSet', ->
    it 'should have a RedBlackTreeStrategy', ->
      expect(SortedSet.RedBlackTreeStrategy).toBeDefined()

    it 'should have a BinaryTreeStrategy', ->
      expect(SortedSet.BinaryTreeStrategy).toBeDefined()

    it 'should have an ArrayStrategy', ->
      expect(SortedSet.ArrayStrategy).toBeDefined()

    it 'should default to RedBlackTreeStrategy', ->
      set = new SortedSet(comparator: numberCompare)
      expect(set.priv.constructor).toBe(SortedSet.RedBlackTreeStrategy)

    it 'should set a default comparator', ->
      set = new SortedSet(strategy: SortedSet.RedBlackTreeStrategy)
      expect(set.priv.comparator(2, 3)).toEqual(-1)

  describe 'integration tests', ->
    set = undefined

    beforeEach -> set = new SortedSet()

    it 'should stay sorted', ->
      set.insert(1)
      set.insert(3)
      set.insert(2)
      expect(set.toArray()).toEqual([1, 2, 3])

    it 'should remove', ->
      set.insert(1)
      set.insert(2)
      set.remove(2)
      expect(set.toArray()).toEqual([1])

    it 'should map', ->
      set.insert(1)
      set.insert(2)
      expect(set.map((v) -> v * 2)).toEqual([2, 4])

    it 'should iterate', ->
      set.insert(1)
      set.insert(2)
      iterator = set.beginIterator()
      expect(iterator.value()).toEqual(1)
      iterator = iterator.next()
      expect(iterator.value()).toEqual(2)
      iterator = iterator.next()
      expect(iterator.value()).toBe(null)
      iterator = iterator.next()
      expect(iterator).toBe(null)
