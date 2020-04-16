import AbstractSortedSet from './SortedSet/AbstractSortedSet';
import ArrayStrategy from './SortedSet/ArrayStrategy';
import BinaryTreeStrategy from './SortedSet/BinaryTreeStrategy';
import RedBlackTreeStrategy from './SortedSet/RedBlackTreeStrategy';
import InsertConflictResolvers from './SortedSet/InsertConflictResolvers';

class SortedSet extends AbstractSortedSet {
  constructor(options) {
    options || (options = {});
    options.strategy || (options.strategy = RedBlackTreeStrategy);
    options.comparator || (options.comparator = function(a, b) {
      return (a || 0) - (b || 0);
    });
    options.onInsertConflict || (options.onInsertConflict = InsertConflictResolvers.OnInsertConflictThrow);
    super(options);
  }
};

SortedSet.ArrayStrategy = ArrayStrategy;
SortedSet.BinaryTreeStrategy = BinaryTreeStrategy;
SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy;

Object.assign(SortedSet, InsertConflictResolvers);

export default SortedSet;

