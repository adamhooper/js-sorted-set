AbstractSortedSet = require('./SortedSet/AbstractSortedSet')
ArrayStrategy = require('./SortedSet/ArrayStrategy')
BinaryTreeStrategy = require('./SortedSet/BinaryTreeStrategy')
RedBlackTreeStrategy = require('./SortedSet/RedBlackTreeStrategy')
enums = require('./enums')

class SortedSet extends AbstractSortedSet
  constructor: (options) ->
    options ||= {}
    options.strategy ||= RedBlackTreeStrategy
    options.comparator ||= (a, b) -> (a || 0) - (b || 0)
    options.insertBehavior ||= enums.insertBehaviors.throw
    super(options)

SortedSet.ArrayStrategy = ArrayStrategy
SortedSet.BinaryTreeStrategy = BinaryTreeStrategy
SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy
SortedSet.insertBehaviors = enums.insertBehaviors

module.exports = SortedSet
