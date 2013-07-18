define [
  './SortedSet/AbstractSortedSet'
  './SortedSet/ArrayStrategy'
  './SortedSet/BinaryTreeStrategy'
  './SortedSet/RedBlackTreeStrategy'
], (
  AbstractSortedSet,
  ArrayStrategy,
  BinaryTreeStrategy,
  RedBlackTreeStrategy
) ->
  class SortedSet extends AbstractSortedSet
    constructor: (options) ->
      options ||= {}
      options.strategy ||= RedBlackTreeStrategy
      options.comparator ||= (a, b) -> (a || 0) - (b || 0)
      super(options)

  SortedSet.ArrayStrategy = ArrayStrategy
  SortedSet.BinaryTreeStrategy = BinaryTreeStrategy
  SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy

  SortedSet
