AbstractSortedSet = require('./SortedSet/AbstractSortedSet')
ArrayStrategy = require('./SortedSet/ArrayStrategy')
BinaryTreeStrategy = require('./SortedSet/BinaryTreeStrategy')
RedBlackTreeStrategy = require('./SortedSet/RedBlackTreeStrategy')

class SortedSet extends AbstractSortedSet
  constructor: (options) ->
    options ||= {}
    options.strategy ||= RedBlackTreeStrategy
    options.comparator ||= (a, b) -> (a || 0) - (b || 0)
    super(options)

SortedSet.ArrayStrategy = ArrayStrategy
SortedSet.BinaryTreeStrategy = BinaryTreeStrategy
SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy

module.exports = SortedSet
