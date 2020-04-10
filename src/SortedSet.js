
import AbstractSortedSet from './SortedSet/AbstractSortedSet';
import ArrayStrategy from './SortedSet/ArrayStrategy';
import BinaryTreeStrategy from './SortedSet/BinaryTreeStrategy';
import RedBlackTreeStrategy from './SortedSet/RedBlackTreeStrategy';
import * as insertConflictResolvers from './insertConflictResolvers';

class SortedSet extends AbstractSortedSet {
  constructor(options) {
    options || (options = {});
    options.strategy || (options.strategy = RedBlackTreeStrategy);
    options.comparator || (options.comparator = function(a, b) {
      return (a || 0) - (b || 0);
    });
    options.onInsertConflict || (options.onInsertConflict = insertConflictResolvers.throw);
    super(options);
  }
};

SortedSet.ArrayStrategy = ArrayStrategy;
SortedSet.BinaryTreeStrategy = BinaryTreeStrategy;
SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy;

SortedSet.OnInsertConflictThrow = insertConflictResolvers.throw;
SortedSet.OnInsertConflictReplace = insertConflictResolvers.replace;
SortedSet.OnInsertConflictIgnore = insertConflictResolvers.ignore;

export default SortedSet;

