AbstractSortedSet = require('./SortedSet/AbstractSortedSet')
ArrayStrategy = require('./SortedSet/ArrayStrategy')
BinaryTreeStrategy = require('./SortedSet/BinaryTreeStrategy')
RedBlackTreeStrategy = require('./SortedSet/RedBlackTreeStrategy')
insertConflictResolvers = require('./insertConflictResolvers')

class SortedSet extends AbstractSortedSet
  constructor: (options) ->
    options ||= {}
    options.strategy ||= RedBlackTreeStrategy
    options.comparator ||= (a, b) -> (a || 0) - (b || 0)
    options.onInsertConflict ||= insertConflictResolvers.throw
    super(options)

SortedSet.ArrayStrategy = ArrayStrategy
SortedSet.BinaryTreeStrategy = BinaryTreeStrategy
SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy

SortedSet.onInsertConflictThrow = insertConflictResolvers.throw
SortedSet.onInsertConflictReplace = insertConflictResolvers.replace
SortedSet.onInsertConflictIgnore = insertConflictResolvers.ignore

module.exports = SortedSet
