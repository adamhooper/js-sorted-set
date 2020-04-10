(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.SortedSet = factory());
}(this, (function () { 'use strict';

  class AbstractSortedSet {
    constructor(options) {
      if ((options != null ? options.strategy : void 0) == null) {
        throw 'Must pass options.strategy, a strategy';
      }
      if ((options != null ? options.comparator : void 0) == null) {
        throw 'Must pass options.comparator, a comparator';
      }
      if ((options != null ? options.onInsertConflict : void 0) == null) {
        throw 'Must pass options.onInsertConflict, a function';
      }
      this.priv = new options.strategy(options);
      this.length = 0;
    }

    insert(value) {
      this.priv.insert(value);
      this.length += 1;
      return this;
    }

    remove(value) {
      this.priv.remove(value);
      this.length -= 1;
      return this;
    }

    clear() {
      this.priv.clear();
      this.length = 0;
      return this;
    }

    contains(value) {
      return this.priv.contains(value);
    }

    // Returns this set as an Array
    toArray() {
      return this.priv.toArray();
    }

    forEach(callback, thisArg) {
      this.priv.forEachImpl(callback, this, thisArg);
      return this;
    }

    map(callback, thisArg) {
      var ret;
      ret = [];
      this.forEach(function(value, index, self) {
        return ret.push(callback.call(thisArg, value, index, self));
      });
      return ret;
    }

    filter(callback, thisArg) {
      var ret;
      ret = [];
      this.forEach(function(value, index, self) {
        if (callback.call(thisArg, value, index, self)) {
          return ret.push(value);
        }
      });
      return ret;
    }

    every(callback, thisArg) {
      var ret;
      ret = true;
      this.forEach(function(value, index, self) {
        if (ret && !callback.call(thisArg, value, index, self)) {
          return ret = false;
        }
      });
      return ret;
    }

    some(callback, thisArg) {
      var ret;
      ret = false;
      this.forEach(function(value, index, self) {
        if (!ret && callback.call(thisArg, value, index, self)) {
          return ret = true;
        }
      });
      return ret;
    }

    // An iterator is similar to a C++ iterator: it points _before_ a value.

    // So in this sorted set:

    //   | 1 | 2 | 3 | 4 | 5 |
    //   ^a      ^b          ^c

    // `a` is a pointer to the beginning of the iterator. `a.value()` returns
    // `3`. `a.previous()` returns `null`. `a.setValue()` works, if
    // `options.allowSetValue` is true.

    // `b` is a pointer to the value `3`. `a.previous()` and `a.next()` both do
    // the obvious.

    // `c` is a pointer to the `null` value. `c.previous()` works; `c.next()`
    // returns null. `c.setValue()` throws an exception, even if
    // `options.allowSetValue` is true.

    // Iterators have `hasNext()` and `hasPrevious()` methods, too.

    // Iterators are immutible. `iterator.next()` returns a new iterator.

    // Iterators become invalid as soon as `insert()` or `remove()` is called.
    findIterator(value) {
      return this.priv.findIterator(value);
    }

    // Finds an iterator pointing to the lowest possible value.
    beginIterator() {
      return this.priv.beginIterator();
    }

    // Finds an iterator pointing to the `null` value.
    endIterator() {
      return this.priv.endIterator();
    }

  }

  class Iterator {
    constructor(priv, index1) {
      this.priv = priv;
      this.index = index1;
      this.data = this.priv.data;
    }

    hasNext() {
      return this.index < this.data.length;
    }

    hasPrevious() {
      return this.index > 0;
    }

    value() {
      if (this.index < this.data.length) {
        return this.data[this.index];
      } else {
        return null;
      }
    }

    setValue(value) {
      if (!this.priv.options.allowSetValue) {
        throw 'Must set options.allowSetValue';
      }
      if (!this.hasNext()) {
        throw 'Cannot set value at end of set';
      }
      return this.data[this.index] = value;
    }

    next() {
      if (this.index >= this.data.length) {
        return null;
      } else {
        return new Iterator(this.priv, this.index + 1);
      }
    }

    previous() {
      if (this.index <= 0) {
        return null;
      } else {
        return new Iterator(this.priv, this.index - 1);
      }
    }

  }
  const binarySearchForIndex = (array, value, comparator) => {
    var high, low, mid;
    low = 0;
    high = array.length;
    while (low < high) {
      mid = (low + high) >>> 1;
      if (comparator(array[mid], value) < 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  };

  class ArrayStrategy {
    constructor(options) {
      this.options = options;
      this.onInsertConflict = this.options.onInsertConflict;
      this.comparator = this.options.comparator;
      this.data = [];
    }

    toArray() {
      return this.data;
    }

    insert(value) {
      var index;
      index = binarySearchForIndex(this.data, value, this.comparator);
      if (this.data[index] !== void 0 && this.comparator(this.data[index], value) === 0) {
        return this.data.splice(index, 1, this.onInsertConflict(this.data[index], value));
      } else {
        return this.data.splice(index, 0, value);
      }
    }

    remove(value) {
      var index;
      index = binarySearchForIndex(this.data, value, this.comparator);
      if (this.data[index] !== value) {
        throw 'Value not in set';
      }
      return this.data.splice(index, 1);
    }

    clear() {
      return this.data.length = 0;
    }

    contains(value) {
      var index;
      index = binarySearchForIndex(this.data, value, this.comparator);
      return this.index !== this.data.length && this.data[index] === value;
    }

    forEachImpl(callback, sortedSet, thisArg) {
      var i, index, len, ref, value;
      ref = this.data;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        value = ref[index];
        callback.call(thisArg, value, index, sortedSet);
      }
      return void 0;
    }

    findIterator(value) {
      var index;
      index = binarySearchForIndex(this.data, value, this.comparator);
      return new Iterator(this, index);
    }

    beginIterator() {
      return new Iterator(this, 0);
    }

    endIterator() {
      return new Iterator(this, this.data.length);
    }

  }

  const descendAllTheWay = (leftOrRight, node) => {
    var parent;
    // Assumes node._iteratorParentNode is set
    while (node[leftOrRight] !== null) {
      parent = node;
      node = node[leftOrRight];
      node._iteratorParentNode = parent;
    }
    return node;
  };

  const moveCursor = (leftOrRight, node) => {
    var parent, rightOrLeft;
    if (node[leftOrRight] !== null) {
      parent = node;
      node = node[leftOrRight];
      node._iteratorParentNode = parent;
      rightOrLeft = leftOrRight === 'left' ? 'right' : 'left';
      node = descendAllTheWay(rightOrLeft, node);
    } else {
      while ((parent = node._iteratorParentNode) !== null && parent[leftOrRight] === node) {
        node = parent;
      }
      node = parent; // either null or the correct-direction parent
    }
    return node;
  };

  // The BinaryTreeIterator actually writes to the tree: it maintains a
  // "_iteratorParentNode" variable on each node. Please ignore this.
  class BinaryTreeIterator {
    constructor(tree1, node1) {
      this.tree = tree1;
      this.node = node1;
    }

    next() {
      var node;
      if (this.node === null) {
        return null;
      } else {
        node = moveCursor('right', this.node);
        return new BinaryTreeIterator(this.tree, node);
      }
    }

    previous() {
      var node;
      if (this.node === null) {
        if (this.tree.root === null) {
          return null;
        } else {
          this.tree.root._iteratorParentNode = null;
          node = descendAllTheWay('right', this.tree.root);
          return new BinaryTreeIterator(this.tree, node);
        }
      } else {
        node = moveCursor('left', this.node);
        if (node === null) {
          return null;
        } else {
          return new BinaryTreeIterator(this.tree, node);
        }
      }
    }

    hasNext() {
      return this.node !== null;
    }

    hasPrevious() {
      return this.previous() !== null;
    }

    value() {
      if (this.node === null) {
        return null;
      } else {
        return this.node.value;
      }
    }

    setValue(value) {
      if (!this.tree.options.allowSetValue) {
        throw 'Must set options.allowSetValue';
      }
      if (!this.hasNext()) {
        throw 'Cannot set value at end of set';
      }
      return this.node.value = value;
    }

  }
  BinaryTreeIterator.find = function(tree, value, comparator) {
    var cmp, nextNode, node, root;
    root = tree.root;
    if (root != null) {
      root._iteratorParentNode = null;
    }
    node = root;
    nextNode = null; // For finding an in-between node
    while (node !== null) {
      cmp = comparator(value, node.value);
      if (cmp === 0) {
        break;
      } else if (cmp < 0) {
        if (node.left === null) {
          break;
        }
        nextNode = node; // If we descend all right after this until there are
        // no more right nodes, we want to return an
        // "in-between" iterator ... pointing here.
        node.left._iteratorParentNode = node;
        node = node.left;
      } else {
        if (node.right !== null) {
          node.right._iteratorParentNode = node;
          node = node.right;
        } else {
          node = nextNode;
          break;
        }
      }
    }
    return new BinaryTreeIterator(tree, node);
  };

  BinaryTreeIterator.left = (tree) => {
    var node;
    if (tree.root === null) {
      return new BinaryTreeIterator(tree, null);
    } else {
      tree.root._iteratorParentNode = null;
      node = descendAllTheWay('left', tree.root);
      return new BinaryTreeIterator(tree, node);
    }
  };

  BinaryTreeIterator.right = (tree) => {
    return new BinaryTreeIterator(tree, null);
  };

  const binaryTreeTraverse = (node, callback) => {
    if (node !== null) {
      binaryTreeTraverse(node.left, callback);
      callback(node.value);
      binaryTreeTraverse(node.right, callback);
    }
    return void 0;
  };

  // An AbstractBinaryTree has a @root. @root is null or an object with
  // `.left`, `.right` and `.value` properties.
  class AbstractBinaryTree {
    toArray() {
      var ret;
      ret = [];
      binaryTreeTraverse(this.root, function(value) {
        return ret.push(value);
      });
      return ret;
    }

    clear() {
      return this.root = null;
    }

    forEachImpl(callback, sortedSet, thisArg) {
      var i;
      i = 0;
      binaryTreeTraverse(this.root, function(value) {
        callback.call(thisArg, value, i, sortedSet);
        return i += 1;
      });
      return void 0;
    }

    contains(value) {
      var cmp, comparator, node;
      comparator = this.comparator;
      node = this.root;
      while (node !== null) {
        cmp = comparator(value, node.value);
        if (cmp === 0) {
          break;
        } else if (cmp < 0) {
          node = node.left;
        } else {
          node = node.right;
        }
      }
      return node !== null && node.value === value;
    }

    findIterator(value) {
      return BinaryTreeIterator.find(this, value, this.comparator);
    }

    beginIterator() {
      return BinaryTreeIterator.left(this);
    }

    endIterator() {
      return BinaryTreeIterator.right(this);
    }

  }

  class Node {
    constructor(value1) {
      this.value = value1;
      this.left = null;
      this.right = null;
    }

  }
  const nodeAllTheWay = (node, leftOrRight) => {
    while (node[leftOrRight] !== null) {
      node = node[leftOrRight];
    }
    return node;
  };

  // Returns the subtree, minus value
  const binaryTreeDelete = (node, value, comparator) => {
    var cmp, nextNode;
    if (node === null) {
      throw 'Value not in set';
    }
    cmp = comparator(value, node.value);
    if (cmp < 0) {
      node.left = binaryTreeDelete(node.left, value, comparator);
    } else if (cmp > 0) {
      node.right = binaryTreeDelete(node.right, value, comparator); // This is the value we want to remove
    } else {
      if (node.left === null && node.right === null) {
        node = null;
      } else if (node.right === null) {
        node = node.left;
      } else if (node.left === null) {
        node = node.right;
      } else {
        nextNode = nodeAllTheWay(node.right, 'left');
        node.value = nextNode.value;
        node.right = binaryTreeDelete(node.right, nextNode.value, comparator);
      }
    }
    return node;
  };

  class BinaryTreeStrategy extends AbstractBinaryTree {
    constructor(options) {
      super();
      this.options = options;
      this.comparator = this.options.comparator;
      this.onInsertConflict = this.options.onInsertConflict;
      this.root = null;
    }

    insert(value) {
      var cmp, compare, leftOrRight, parent;
      compare = this.comparator;
      if (this.root != null) {
        parent = this.root;
        while (true) {
          cmp = compare(value, parent.value);
          if (cmp === 0) {
            parent.value = this.onInsertConflict(parent.value, value);
            return;
          } else {
            leftOrRight = cmp < 0 ? 'left' : 'right';
            if (parent[leftOrRight] === null) {
              break;
            }
            parent = parent[leftOrRight];
          }
        }
        return parent[leftOrRight] = new Node(value);
      } else {
        return this.root = new Node(value);
      }
    }

    remove(value) {
      return this.root = binaryTreeDelete(this.root, value, this.comparator);
    }

  }

  // An implementation of Left-Leaning Red-Black trees.

  // It's copied from http://www.cs.princeton.edu/~rs/talks/LLRB/LLRB.pdf.
  // It's practically a copy-paste job, minus the semicolons. missing bits were
  // filled in with hints from
  // http://www.teachsolaisgames.com/articles/balanced_left_leaning.html

  // Here are some differences:
  // * This isn't a map structure: it's just a tree. There are no keys: the
  //   comparator applies to the values.
  // * We use the passed comparator.
  class Node$1 {
    constructor(value1) {
      this.value = value1;
      this.left = null;
      this.right = null;
      this.isRed = true; // null nodes -- leaves -- are black
    }

  }
  const rotateLeft = (h) => {
    var x;
    x = h.right;
    h.right = x.left;
    x.left = h;
    x.isRed = h.isRed;
    h.isRed = true;
    return x;
  };

  const rotateRight = (h) => {
    var x;
    x = h.left;
    h.left = x.right;
    x.right = h;
    x.isRed = h.isRed;
    h.isRed = true;
    return x;
  };

  const colorFlip = (h) => {
    h.isRed = !h.isRed;
    h.left.isRed = !h.left.isRed;
    h.right.isRed = !h.right.isRed;
    return void 0;
  };

  const moveRedLeft = (h) => {
    //throw 'Preconditions failed' if !(!h.left.isRed && !h.left.left?.isRed)
    colorFlip(h);
    if (h.right !== null && h.right.left !== null && h.right.left.isRed) {
      h.right = rotateRight(h.right);
      h = rotateLeft(h);
      colorFlip(h);
    }
    return h;
  };

  const moveRedRight = (h) => {
    //throw 'Preconditions failed' if !(!h.right.isRed && !h.right.left?.isRed)
    colorFlip(h);
    if (h.left !== null && h.left.left !== null && h.left.left.isRed) {
      h = rotateRight(h);
      colorFlip(h);
    }
    return h;
  };

  const insertInNode = (h, value, compare, onInsertConflict) => {
    var cmp;
    if (h === null) {
      return new Node$1(value);
    }
    //if h.left isnt null && h.left.isRed && h.right isnt null && h.right.isRed
    //  colorFlip(h)
    cmp = compare(value, h.value);
    if (cmp === 0) {
      h.value = onInsertConflict(h.value, value);
    } else if (cmp < 0) {
      h.left = insertInNode(h.left, value, compare, onInsertConflict);
    } else {
      h.right = insertInNode(h.right, value, compare, onInsertConflict);
    }
    if (h.right !== null && h.right.isRed && !(h.left !== null && h.left.isRed)) {
      h = rotateLeft(h);
    }
    if (h.left !== null && h.left.isRed && h.left.left !== null && h.left.left.isRed) {
      h = rotateRight(h);
    }
    // Put this here -- I couldn't get the whole thing to work otherwise :(
    if (h.left !== null && h.left.isRed && h.right !== null && h.right.isRed) {
      colorFlip(h);
    }
    return h;
  };

  const findMinNode = (h) => {
    while (h.left !== null) {
      h = h.left;
    }
    return h;
  };

  const fixUp = (h) => {
    // Fix right-leaning red nodes
    if (h.right !== null && h.right.isRed) {
      h = rotateLeft(h);
    }
    // Handle a 4-node that traverses down the left
    if (h.left !== null && h.left.isRed && h.left.left !== null && h.left.left.isRed) {
      h = rotateRight(h);
    }
    // split 4-nodes
    if (h.left !== null && h.left.isRed && h.right !== null && h.right.isRed) {
      colorFlip(h);
    }
    return h;
  };

  const removeMinNode = (h) => {
    if (h.left === null) {
      return null;
    }
    if (!h.left.isRed && !(h.left.left !== null && h.left.left.isRed)) {
      h = moveRedLeft(h);
    }
    h.left = removeMinNode(h.left);
    return fixUp(h);
  };

  const removeFromNode = (h, value, compare) => {
    if (h === null) {
      throw 'Value not in set';
    }
    if (h.value !== value && compare(value, h.value) < 0) {
      if (h.left === null) {
        throw 'Value not in set';
      }
      if (!h.left.isRed && !(h.left.left !== null && h.left.left.isRed)) {
        h = moveRedLeft(h);
      }
      h.left = removeFromNode(h.left, value, compare);
    } else {
      if (h.left !== null && h.left.isRed) {
        h = rotateRight(h);
      }
      if (h.right === null) {
        if (value === h.value) {
          return null; // leaf node; LLRB assures no left value here
        } else {
          throw 'Value not in set';
        }
      }
      if (!h.right.isRed && !(h.right.left !== null && h.right.left.isRed)) {
        h = moveRedRight(h);
      }
      if (value === h.value) {
        h.value = findMinNode(h.right).value;
        h.right = removeMinNode(h.right);
      } else {
        h.right = removeFromNode(h.right, value, compare);
      }
    }
    if (h !== null) {
      h = fixUp(h);
    }
    return h;
  };

  class RedBlackTreeStrategy extends AbstractBinaryTree {
    constructor(options) {
      super();
      this.options = options;
      this.comparator = this.options.comparator;
      this.onInsertConflict = this.options.onInsertConflict;
      this.root = null;
    }

    insert(value) {
      this.root = insertInNode(this.root, value, this.comparator, this.onInsertConflict);
      this.root.isRed = false; // always
      return void 0;
    }

    remove(value) {
      this.root = removeFromNode(this.root, value, this.comparator);
      if (this.root !== null) {
        this.root.isRed = false;
      }
      return void 0;
    }

  }

  const throw_ = (oldValue, newValue) => {
    throw 'Value already in set';
  };

  const replace = (oldValue, newValue) => {
    return newValue;
  };

  const ignore = (oldValue, newValue) => {
    return oldValue;
  };

  class SortedSet extends AbstractSortedSet {
    constructor(options) {
      options || (options = {});
      options.strategy || (options.strategy = RedBlackTreeStrategy);
      options.comparator || (options.comparator = function(a, b) {
        return (a || 0) - (b || 0);
      });
      options.onInsertConflict || (options.onInsertConflict = throw_);
      super(options);
    }
  }
  SortedSet.ArrayStrategy = ArrayStrategy;
  SortedSet.BinaryTreeStrategy = BinaryTreeStrategy;
  SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy;

  SortedSet.OnInsertConflictThrow = throw_;
  SortedSet.OnInsertConflictReplace = replace;
  SortedSet.OnInsertConflictIgnore = ignore;

  return SortedSet;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29ydGVkU2V0LnVtZC1idW5kbGUuanMiLCJzb3VyY2VzIjpbInNyYy9Tb3J0ZWRTZXQvQWJzdHJhY3RTb3J0ZWRTZXQuanMiLCJzcmMvU29ydGVkU2V0L0FycmF5U3RyYXRlZ3kuanMiLCJzcmMvU29ydGVkU2V0L0JpbmFyeVRyZWVJdGVyYXRvci5qcyIsInNyYy9Tb3J0ZWRTZXQvQWJzdHJhY3RCaW5hcnlUcmVlU3RyYXRlZ3kuanMiLCJzcmMvU29ydGVkU2V0L0JpbmFyeVRyZWVTdHJhdGVneS5qcyIsInNyYy9Tb3J0ZWRTZXQvUmVkQmxhY2tUcmVlU3RyYXRlZ3kuanMiLCJzcmMvaW5zZXJ0Q29uZmxpY3RSZXNvbHZlcnMuanMiLCJzcmMvU29ydGVkU2V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQWJzdHJhY3RTb3J0ZWRTZXQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLnN0cmF0ZWd5IDogdm9pZCAwKSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyAnTXVzdCBwYXNzIG9wdGlvbnMuc3RyYXRlZ3ksIGEgc3RyYXRlZ3knO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuY29tcGFyYXRvciA6IHZvaWQgMCkgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgJ011c3QgcGFzcyBvcHRpb25zLmNvbXBhcmF0b3IsIGEgY29tcGFyYXRvcic7XG4gICAgfVxuICAgIGlmICgob3B0aW9ucyAhPSBudWxsID8gb3B0aW9ucy5vbkluc2VydENvbmZsaWN0IDogdm9pZCAwKSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyAnTXVzdCBwYXNzIG9wdGlvbnMub25JbnNlcnRDb25mbGljdCwgYSBmdW5jdGlvbic7XG4gICAgfVxuICAgIHRoaXMucHJpdiA9IG5ldyBvcHRpb25zLnN0cmF0ZWd5KG9wdGlvbnMpO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgfVxuXG4gIGluc2VydCh2YWx1ZSkge1xuICAgIHRoaXMucHJpdi5pbnNlcnQodmFsdWUpO1xuICAgIHRoaXMubGVuZ3RoICs9IDE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmUodmFsdWUpIHtcbiAgICB0aGlzLnByaXYucmVtb3ZlKHZhbHVlKTtcbiAgICB0aGlzLmxlbmd0aCAtPSAxO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5wcml2LmNsZWFyKCk7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY29udGFpbnModmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5wcml2LmNvbnRhaW5zKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhpcyBzZXQgYXMgYW4gQXJyYXlcbiAgdG9BcnJheSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcml2LnRvQXJyYXkoKTtcbiAgfVxuXG4gIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB0aGlzLnByaXYuZm9yRWFjaEltcGwoY2FsbGJhY2ssIHRoaXMsIHRoaXNBcmcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbWFwKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgdmFyIHJldDtcbiAgICByZXQgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4LCBzZWxmKSB7XG4gICAgICByZXR1cm4gcmV0LnB1c2goY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIHNlbGYpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZmlsdGVyKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgdmFyIHJldDtcbiAgICByZXQgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGluZGV4LCBzZWxmKSB7XG4gICAgICBpZiAoY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIHNlbGYpKSB7XG4gICAgICAgIHJldHVybiByZXQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGV2ZXJ5KGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgdmFyIHJldDtcbiAgICByZXQgPSB0cnVlO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIHNlbGYpIHtcbiAgICAgIGlmIChyZXQgJiYgIWNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBzZWxmKSkge1xuICAgICAgICByZXR1cm4gcmV0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHNvbWUoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB2YXIgcmV0O1xuICAgIHJldCA9IGZhbHNlO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIHNlbGYpIHtcbiAgICAgIGlmICghcmV0ICYmIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBzZWxmKSkge1xuICAgICAgICByZXR1cm4gcmV0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gQW4gaXRlcmF0b3IgaXMgc2ltaWxhciB0byBhIEMrKyBpdGVyYXRvcjogaXQgcG9pbnRzIF9iZWZvcmVfIGEgdmFsdWUuXG5cbiAgLy8gU28gaW4gdGhpcyBzb3J0ZWQgc2V0OlxuXG4gIC8vICAgfCAxIHwgMiB8IDMgfCA0IHwgNSB8XG4gIC8vICAgXmEgICAgICBeYiAgICAgICAgICBeY1xuXG4gIC8vIGBhYCBpcyBhIHBvaW50ZXIgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgaXRlcmF0b3IuIGBhLnZhbHVlKClgIHJldHVybnNcbiAgLy8gYDNgLiBgYS5wcmV2aW91cygpYCByZXR1cm5zIGBudWxsYC4gYGEuc2V0VmFsdWUoKWAgd29ya3MsIGlmXG4gIC8vIGBvcHRpb25zLmFsbG93U2V0VmFsdWVgIGlzIHRydWUuXG5cbiAgLy8gYGJgIGlzIGEgcG9pbnRlciB0byB0aGUgdmFsdWUgYDNgLiBgYS5wcmV2aW91cygpYCBhbmQgYGEubmV4dCgpYCBib3RoIGRvXG4gIC8vIHRoZSBvYnZpb3VzLlxuXG4gIC8vIGBjYCBpcyBhIHBvaW50ZXIgdG8gdGhlIGBudWxsYCB2YWx1ZS4gYGMucHJldmlvdXMoKWAgd29ya3M7IGBjLm5leHQoKWBcbiAgLy8gcmV0dXJucyBudWxsLiBgYy5zZXRWYWx1ZSgpYCB0aHJvd3MgYW4gZXhjZXB0aW9uLCBldmVuIGlmXG4gIC8vIGBvcHRpb25zLmFsbG93U2V0VmFsdWVgIGlzIHRydWUuXG5cbiAgLy8gSXRlcmF0b3JzIGhhdmUgYGhhc05leHQoKWAgYW5kIGBoYXNQcmV2aW91cygpYCBtZXRob2RzLCB0b28uXG5cbiAgLy8gSXRlcmF0b3JzIGFyZSBpbW11dGlibGUuIGBpdGVyYXRvci5uZXh0KClgIHJldHVybnMgYSBuZXcgaXRlcmF0b3IuXG5cbiAgLy8gSXRlcmF0b3JzIGJlY29tZSBpbnZhbGlkIGFzIHNvb24gYXMgYGluc2VydCgpYCBvciBgcmVtb3ZlKClgIGlzIGNhbGxlZC5cbiAgZmluZEl0ZXJhdG9yKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMucHJpdi5maW5kSXRlcmF0b3IodmFsdWUpO1xuICB9XG5cbiAgLy8gRmluZHMgYW4gaXRlcmF0b3IgcG9pbnRpbmcgdG8gdGhlIGxvd2VzdCBwb3NzaWJsZSB2YWx1ZS5cbiAgYmVnaW5JdGVyYXRvcigpIHtcbiAgICByZXR1cm4gdGhpcy5wcml2LmJlZ2luSXRlcmF0b3IoKTtcbiAgfVxuXG4gIC8vIEZpbmRzIGFuIGl0ZXJhdG9yIHBvaW50aW5nIHRvIHRoZSBgbnVsbGAgdmFsdWUuXG4gIGVuZEl0ZXJhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLnByaXYuZW5kSXRlcmF0b3IoKTtcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBBYnN0cmFjdFNvcnRlZFNldDtcblxuIiwiXG5jbGFzcyBJdGVyYXRvciB7XG4gIGNvbnN0cnVjdG9yKHByaXYsIGluZGV4MSkge1xuICAgIHRoaXMucHJpdiA9IHByaXY7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4MTtcbiAgICB0aGlzLmRhdGEgPSB0aGlzLnByaXYuZGF0YTtcbiAgfVxuXG4gIGhhc05leHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPCB0aGlzLmRhdGEubGVuZ3RoO1xuICB9XG5cbiAgaGFzUHJldmlvdXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPiAwO1xuICB9XG5cbiAgdmFsdWUoKSB7XG4gICAgaWYgKHRoaXMuaW5kZXggPCB0aGlzLmRhdGEubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW3RoaXMuaW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICghdGhpcy5wcml2Lm9wdGlvbnMuYWxsb3dTZXRWYWx1ZSkge1xuICAgICAgdGhyb3cgJ011c3Qgc2V0IG9wdGlvbnMuYWxsb3dTZXRWYWx1ZSc7XG4gICAgfVxuICAgIGlmICghdGhpcy5oYXNOZXh0KCkpIHtcbiAgICAgIHRocm93ICdDYW5ub3Qgc2V0IHZhbHVlIGF0IGVuZCBvZiBzZXQnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kYXRhW3RoaXMuaW5kZXhdID0gdmFsdWU7XG4gIH1cblxuICBuZXh0KCkge1xuICAgIGlmICh0aGlzLmluZGV4ID49IHRoaXMuZGF0YS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKHRoaXMucHJpdiwgdGhpcy5pbmRleCArIDEpO1xuICAgIH1cbiAgfVxuXG4gIHByZXZpb3VzKCkge1xuICAgIGlmICh0aGlzLmluZGV4IDw9IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKHRoaXMucHJpdiwgdGhpcy5pbmRleCAtIDEpO1xuICAgIH1cbiAgfVxuXG59O1xuXG5jb25zdCBiaW5hcnlTZWFyY2hGb3JJbmRleCA9IChhcnJheSwgdmFsdWUsIGNvbXBhcmF0b3IpID0+IHtcbiAgdmFyIGhpZ2gsIGxvdywgbWlkO1xuICBsb3cgPSAwO1xuICBoaWdoID0gYXJyYXkubGVuZ3RoO1xuICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgIG1pZCA9IChsb3cgKyBoaWdoKSA+Pj4gMTtcbiAgICBpZiAoY29tcGFyYXRvcihhcnJheVttaWRdLCB2YWx1ZSkgPCAwKSB7XG4gICAgICBsb3cgPSBtaWQgKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWdoID0gbWlkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbG93O1xufTtcblxuY2xhc3MgQXJyYXlTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMub25JbnNlcnRDb25mbGljdCA9IHRoaXMub3B0aW9ucy5vbkluc2VydENvbmZsaWN0O1xuICAgIHRoaXMuY29tcGFyYXRvciA9IHRoaXMub3B0aW9ucy5jb21wYXJhdG9yO1xuICAgIHRoaXMuZGF0YSA9IFtdO1xuICB9XG5cbiAgdG9BcnJheSgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhO1xuICB9XG5cbiAgaW5zZXJ0KHZhbHVlKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gYmluYXJ5U2VhcmNoRm9ySW5kZXgodGhpcy5kYXRhLCB2YWx1ZSwgdGhpcy5jb21wYXJhdG9yKTtcbiAgICBpZiAodGhpcy5kYXRhW2luZGV4XSAhPT0gdm9pZCAwICYmIHRoaXMuY29tcGFyYXRvcih0aGlzLmRhdGFbaW5kZXhdLCB2YWx1ZSkgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGEuc3BsaWNlKGluZGV4LCAxLCB0aGlzLm9uSW5zZXJ0Q29uZmxpY3QodGhpcy5kYXRhW2luZGV4XSwgdmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YS5zcGxpY2UoaW5kZXgsIDAsIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmUodmFsdWUpIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSBiaW5hcnlTZWFyY2hGb3JJbmRleCh0aGlzLmRhdGEsIHZhbHVlLCB0aGlzLmNvbXBhcmF0b3IpO1xuICAgIGlmICh0aGlzLmRhdGFbaW5kZXhdICE9PSB2YWx1ZSkge1xuICAgICAgdGhyb3cgJ1ZhbHVlIG5vdCBpbiBzZXQnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kYXRhLnNwbGljZShpbmRleCwgMSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aCA9IDA7XG4gIH1cblxuICBjb250YWlucyh2YWx1ZSkge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IGJpbmFyeVNlYXJjaEZvckluZGV4KHRoaXMuZGF0YSwgdmFsdWUsIHRoaXMuY29tcGFyYXRvcik7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggIT09IHRoaXMuZGF0YS5sZW5ndGggJiYgdGhpcy5kYXRhW2luZGV4XSA9PT0gdmFsdWU7XG4gIH1cblxuICBmb3JFYWNoSW1wbChjYWxsYmFjaywgc29ydGVkU2V0LCB0aGlzQXJnKSB7XG4gICAgdmFyIGksIGluZGV4LCBsZW4sIHJlZiwgdmFsdWU7XG4gICAgcmVmID0gdGhpcy5kYXRhO1xuICAgIGZvciAoaW5kZXggPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaW5kZXggPSArK2kpIHtcbiAgICAgIHZhbHVlID0gcmVmW2luZGV4XTtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBzb3J0ZWRTZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG5cbiAgZmluZEl0ZXJhdG9yKHZhbHVlKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gYmluYXJ5U2VhcmNoRm9ySW5kZXgodGhpcy5kYXRhLCB2YWx1ZSwgdGhpcy5jb21wYXJhdG9yKTtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKHRoaXMsIGluZGV4KTtcbiAgfVxuXG4gIGJlZ2luSXRlcmF0b3IoKSB7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcih0aGlzLCAwKTtcbiAgfVxuXG4gIGVuZEl0ZXJhdG9yKCkge1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IodGhpcywgdGhpcy5kYXRhLmxlbmd0aCk7XG4gIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgQXJyYXlTdHJhdGVneTtcbiIsIlxuY29uc3QgZGVzY2VuZEFsbFRoZVdheSA9IChsZWZ0T3JSaWdodCwgbm9kZSkgPT4ge1xuICB2YXIgcGFyZW50O1xuICAvLyBBc3N1bWVzIG5vZGUuX2l0ZXJhdG9yUGFyZW50Tm9kZSBpcyBzZXRcbiAgd2hpbGUgKG5vZGVbbGVmdE9yUmlnaHRdICE9PSBudWxsKSB7XG4gICAgcGFyZW50ID0gbm9kZTtcbiAgICBub2RlID0gbm9kZVtsZWZ0T3JSaWdodF07XG4gICAgbm9kZS5faXRlcmF0b3JQYXJlbnROb2RlID0gcGFyZW50O1xuICB9XG4gIHJldHVybiBub2RlO1xufTtcblxuY29uc3QgbW92ZUN1cnNvciA9IChsZWZ0T3JSaWdodCwgbm9kZSkgPT4ge1xuICB2YXIgcGFyZW50LCByaWdodE9yTGVmdDtcbiAgaWYgKG5vZGVbbGVmdE9yUmlnaHRdICE9PSBudWxsKSB7XG4gICAgcGFyZW50ID0gbm9kZTtcbiAgICBub2RlID0gbm9kZVtsZWZ0T3JSaWdodF07XG4gICAgbm9kZS5faXRlcmF0b3JQYXJlbnROb2RlID0gcGFyZW50O1xuICAgIHJpZ2h0T3JMZWZ0ID0gbGVmdE9yUmlnaHQgPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgbm9kZSA9IGRlc2NlbmRBbGxUaGVXYXkocmlnaHRPckxlZnQsIG5vZGUpO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlICgocGFyZW50ID0gbm9kZS5faXRlcmF0b3JQYXJlbnROb2RlKSAhPT0gbnVsbCAmJiBwYXJlbnRbbGVmdE9yUmlnaHRdID09PSBub2RlKSB7XG4gICAgICBub2RlID0gcGFyZW50O1xuICAgIH1cbiAgICBub2RlID0gcGFyZW50OyAvLyBlaXRoZXIgbnVsbCBvciB0aGUgY29ycmVjdC1kaXJlY3Rpb24gcGFyZW50XG4gIH1cbiAgcmV0dXJuIG5vZGU7XG59O1xuXG4vLyBUaGUgQmluYXJ5VHJlZUl0ZXJhdG9yIGFjdHVhbGx5IHdyaXRlcyB0byB0aGUgdHJlZTogaXQgbWFpbnRhaW5zIGFcbi8vIFwiX2l0ZXJhdG9yUGFyZW50Tm9kZVwiIHZhcmlhYmxlIG9uIGVhY2ggbm9kZS4gUGxlYXNlIGlnbm9yZSB0aGlzLlxuY2xhc3MgQmluYXJ5VHJlZUl0ZXJhdG9yIHtcbiAgY29uc3RydWN0b3IodHJlZTEsIG5vZGUxKSB7XG4gICAgdGhpcy50cmVlID0gdHJlZTE7XG4gICAgdGhpcy5ub2RlID0gbm9kZTE7XG4gIH1cblxuICBuZXh0KCkge1xuICAgIHZhciBub2RlO1xuICAgIGlmICh0aGlzLm5vZGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gbW92ZUN1cnNvcigncmlnaHQnLCB0aGlzLm5vZGUpO1xuICAgICAgcmV0dXJuIG5ldyBCaW5hcnlUcmVlSXRlcmF0b3IodGhpcy50cmVlLCBub2RlKTtcbiAgICB9XG4gIH1cblxuICBwcmV2aW91cygpIHtcbiAgICB2YXIgbm9kZTtcbiAgICBpZiAodGhpcy5ub2RlID09PSBudWxsKSB7XG4gICAgICBpZiAodGhpcy50cmVlLnJvb3QgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyZWUucm9vdC5faXRlcmF0b3JQYXJlbnROb2RlID0gbnVsbDtcbiAgICAgICAgbm9kZSA9IGRlc2NlbmRBbGxUaGVXYXkoJ3JpZ2h0JywgdGhpcy50cmVlLnJvb3QpO1xuICAgICAgICByZXR1cm4gbmV3IEJpbmFyeVRyZWVJdGVyYXRvcih0aGlzLnRyZWUsIG5vZGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gbW92ZUN1cnNvcignbGVmdCcsIHRoaXMubm9kZSk7XG4gICAgICBpZiAobm9kZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgQmluYXJ5VHJlZUl0ZXJhdG9yKHRoaXMudHJlZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFzTmV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlICE9PSBudWxsO1xuICB9XG5cbiAgaGFzUHJldmlvdXMoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJldmlvdXMoKSAhPT0gbnVsbDtcbiAgfVxuXG4gIHZhbHVlKCkge1xuICAgIGlmICh0aGlzLm5vZGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5ub2RlLnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKCF0aGlzLnRyZWUub3B0aW9ucy5hbGxvd1NldFZhbHVlKSB7XG4gICAgICB0aHJvdyAnTXVzdCBzZXQgb3B0aW9ucy5hbGxvd1NldFZhbHVlJztcbiAgICB9XG4gICAgaWYgKCF0aGlzLmhhc05leHQoKSkge1xuICAgICAgdGhyb3cgJ0Nhbm5vdCBzZXQgdmFsdWUgYXQgZW5kIG9mIHNldCc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5vZGUudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG59O1xuXG5CaW5hcnlUcmVlSXRlcmF0b3IuZmluZCA9IGZ1bmN0aW9uKHRyZWUsIHZhbHVlLCBjb21wYXJhdG9yKSB7XG4gIHZhciBjbXAsIG5leHROb2RlLCBub2RlLCByb290O1xuICByb290ID0gdHJlZS5yb290O1xuICBpZiAocm9vdCAhPSBudWxsKSB7XG4gICAgcm9vdC5faXRlcmF0b3JQYXJlbnROb2RlID0gbnVsbDtcbiAgfVxuICBub2RlID0gcm9vdDtcbiAgbmV4dE5vZGUgPSBudWxsOyAvLyBGb3IgZmluZGluZyBhbiBpbi1iZXR3ZWVuIG5vZGVcbiAgd2hpbGUgKG5vZGUgIT09IG51bGwpIHtcbiAgICBjbXAgPSBjb21wYXJhdG9yKHZhbHVlLCBub2RlLnZhbHVlKTtcbiAgICBpZiAoY21wID09PSAwKSB7XG4gICAgICBicmVhaztcbiAgICB9IGVsc2UgaWYgKGNtcCA8IDApIHtcbiAgICAgIGlmIChub2RlLmxlZnQgPT09IG51bGwpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBuZXh0Tm9kZSA9IG5vZGU7IC8vIElmIHdlIGRlc2NlbmQgYWxsIHJpZ2h0IGFmdGVyIHRoaXMgdW50aWwgdGhlcmUgYXJlXG4gICAgICAvLyBubyBtb3JlIHJpZ2h0IG5vZGVzLCB3ZSB3YW50IHRvIHJldHVybiBhblxuICAgICAgLy8gXCJpbi1iZXR3ZWVuXCIgaXRlcmF0b3IgLi4uIHBvaW50aW5nIGhlcmUuXG4gICAgICBub2RlLmxlZnQuX2l0ZXJhdG9yUGFyZW50Tm9kZSA9IG5vZGU7XG4gICAgICBub2RlID0gbm9kZS5sZWZ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobm9kZS5yaWdodCAhPT0gbnVsbCkge1xuICAgICAgICBub2RlLnJpZ2h0Ll9pdGVyYXRvclBhcmVudE5vZGUgPSBub2RlO1xuICAgICAgICBub2RlID0gbm9kZS5yaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBuZXh0Tm9kZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXcgQmluYXJ5VHJlZUl0ZXJhdG9yKHRyZWUsIG5vZGUpO1xufTtcblxuQmluYXJ5VHJlZUl0ZXJhdG9yLmxlZnQgPSAodHJlZSkgPT4ge1xuICB2YXIgbm9kZTtcbiAgaWYgKHRyZWUucm9vdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgQmluYXJ5VHJlZUl0ZXJhdG9yKHRyZWUsIG51bGwpO1xuICB9IGVsc2Uge1xuICAgIHRyZWUucm9vdC5faXRlcmF0b3JQYXJlbnROb2RlID0gbnVsbDtcbiAgICBub2RlID0gZGVzY2VuZEFsbFRoZVdheSgnbGVmdCcsIHRyZWUucm9vdCk7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlUcmVlSXRlcmF0b3IodHJlZSwgbm9kZSk7XG4gIH1cbn07XG5cbkJpbmFyeVRyZWVJdGVyYXRvci5yaWdodCA9ICh0cmVlKSA9PiB7XG4gIHJldHVybiBuZXcgQmluYXJ5VHJlZUl0ZXJhdG9yKHRyZWUsIG51bGwpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQmluYXJ5VHJlZUl0ZXJhdG9yO1xuXG4iLCJcbmltcG9ydCBCaW5hcnlUcmVlSXRlcmF0b3IgZnJvbSAnLi9CaW5hcnlUcmVlSXRlcmF0b3InO1xuXG5jb25zdCBiaW5hcnlUcmVlVHJhdmVyc2UgPSAobm9kZSwgY2FsbGJhY2spID0+IHtcbiAgaWYgKG5vZGUgIT09IG51bGwpIHtcbiAgICBiaW5hcnlUcmVlVHJhdmVyc2Uobm9kZS5sZWZ0LCBjYWxsYmFjayk7XG4gICAgY2FsbGJhY2sobm9kZS52YWx1ZSk7XG4gICAgYmluYXJ5VHJlZVRyYXZlcnNlKG5vZGUucmlnaHQsIGNhbGxiYWNrKTtcbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuLy8gQW4gQWJzdHJhY3RCaW5hcnlUcmVlIGhhcyBhIEByb290LiBAcm9vdCBpcyBudWxsIG9yIGFuIG9iamVjdCB3aXRoXG4vLyBgLmxlZnRgLCBgLnJpZ2h0YCBhbmQgYC52YWx1ZWAgcHJvcGVydGllcy5cbmNsYXNzIEFic3RyYWN0QmluYXJ5VHJlZSB7XG4gIHRvQXJyYXkoKSB7XG4gICAgdmFyIHJldDtcbiAgICByZXQgPSBbXTtcbiAgICBiaW5hcnlUcmVlVHJhdmVyc2UodGhpcy5yb290LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJldC5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgcmV0dXJuIHRoaXMucm9vdCA9IG51bGw7XG4gIH1cblxuICBmb3JFYWNoSW1wbChjYWxsYmFjaywgc29ydGVkU2V0LCB0aGlzQXJnKSB7XG4gICAgdmFyIGk7XG4gICAgaSA9IDA7XG4gICAgYmluYXJ5VHJlZVRyYXZlcnNlKHRoaXMucm9vdCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIHNvcnRlZFNldCk7XG4gICAgICByZXR1cm4gaSArPSAxO1xuICAgIH0pO1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICBjb250YWlucyh2YWx1ZSkge1xuICAgIHZhciBjbXAsIGNvbXBhcmF0b3IsIG5vZGU7XG4gICAgY29tcGFyYXRvciA9IHRoaXMuY29tcGFyYXRvcjtcbiAgICBub2RlID0gdGhpcy5yb290O1xuICAgIHdoaWxlIChub2RlICE9PSBudWxsKSB7XG4gICAgICBjbXAgPSBjb21wYXJhdG9yKHZhbHVlLCBub2RlLnZhbHVlKTtcbiAgICAgIGlmIChjbXAgPT09IDApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKGNtcCA8IDApIHtcbiAgICAgICAgbm9kZSA9IG5vZGUubGVmdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBub2RlLnJpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZSAhPT0gbnVsbCAmJiBub2RlLnZhbHVlID09PSB2YWx1ZTtcbiAgfVxuXG4gIGZpbmRJdGVyYXRvcih2YWx1ZSkge1xuICAgIHJldHVybiBCaW5hcnlUcmVlSXRlcmF0b3IuZmluZCh0aGlzLCB2YWx1ZSwgdGhpcy5jb21wYXJhdG9yKTtcbiAgfVxuXG4gIGJlZ2luSXRlcmF0b3IoKSB7XG4gICAgcmV0dXJuIEJpbmFyeVRyZWVJdGVyYXRvci5sZWZ0KHRoaXMpO1xuICB9XG5cbiAgZW5kSXRlcmF0b3IoKSB7XG4gICAgcmV0dXJuIEJpbmFyeVRyZWVJdGVyYXRvci5yaWdodCh0aGlzKTtcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBBYnN0cmFjdEJpbmFyeVRyZWU7XG5cbiIsIiAgXG5pbXBvcnQgQWJzdHJhY3RCaW5hcnlUcmVlU3RyYXRlZ3kgZnJvbSAnLi9BYnN0cmFjdEJpbmFyeVRyZWVTdHJhdGVneSc7XG5cbmNsYXNzIE5vZGUge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZTEpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWUxO1xuICAgIHRoaXMubGVmdCA9IG51bGw7XG4gICAgdGhpcy5yaWdodCA9IG51bGw7XG4gIH1cblxufTtcblxuY29uc3Qgbm9kZUFsbFRoZVdheSA9IChub2RlLCBsZWZ0T3JSaWdodCkgPT4ge1xuICB3aGlsZSAobm9kZVtsZWZ0T3JSaWdodF0gIT09IG51bGwpIHtcbiAgICBub2RlID0gbm9kZVtsZWZ0T3JSaWdodF07XG4gIH1cbiAgcmV0dXJuIG5vZGU7XG59O1xuXG4vLyBSZXR1cm5zIHRoZSBzdWJ0cmVlLCBtaW51cyB2YWx1ZVxuY29uc3QgYmluYXJ5VHJlZURlbGV0ZSA9IChub2RlLCB2YWx1ZSwgY29tcGFyYXRvcikgPT4ge1xuICB2YXIgY21wLCBuZXh0Tm9kZTtcbiAgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICB0aHJvdyAnVmFsdWUgbm90IGluIHNldCc7XG4gIH1cbiAgY21wID0gY29tcGFyYXRvcih2YWx1ZSwgbm9kZS52YWx1ZSk7XG4gIGlmIChjbXAgPCAwKSB7XG4gICAgbm9kZS5sZWZ0ID0gYmluYXJ5VHJlZURlbGV0ZShub2RlLmxlZnQsIHZhbHVlLCBjb21wYXJhdG9yKTtcbiAgfSBlbHNlIGlmIChjbXAgPiAwKSB7XG4gICAgbm9kZS5yaWdodCA9IGJpbmFyeVRyZWVEZWxldGUobm9kZS5yaWdodCwgdmFsdWUsIGNvbXBhcmF0b3IpOyAvLyBUaGlzIGlzIHRoZSB2YWx1ZSB3ZSB3YW50IHRvIHJlbW92ZVxuICB9IGVsc2Uge1xuICAgIGlmIChub2RlLmxlZnQgPT09IG51bGwgJiYgbm9kZS5yaWdodCA9PT0gbnVsbCkge1xuICAgICAgbm9kZSA9IG51bGw7XG4gICAgfSBlbHNlIGlmIChub2RlLnJpZ2h0ID09PSBudWxsKSB7XG4gICAgICBub2RlID0gbm9kZS5sZWZ0O1xuICAgIH0gZWxzZSBpZiAobm9kZS5sZWZ0ID09PSBudWxsKSB7XG4gICAgICBub2RlID0gbm9kZS5yaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dE5vZGUgPSBub2RlQWxsVGhlV2F5KG5vZGUucmlnaHQsICdsZWZ0Jyk7XG4gICAgICBub2RlLnZhbHVlID0gbmV4dE5vZGUudmFsdWU7XG4gICAgICBub2RlLnJpZ2h0ID0gYmluYXJ5VHJlZURlbGV0ZShub2RlLnJpZ2h0LCBuZXh0Tm9kZS52YWx1ZSwgY29tcGFyYXRvcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBub2RlO1xufTtcblxuY2xhc3MgQmluYXJ5VHJlZVN0cmF0ZWd5IGV4dGVuZHMgQWJzdHJhY3RCaW5hcnlUcmVlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuY29tcGFyYXRvciA9IHRoaXMub3B0aW9ucy5jb21wYXJhdG9yO1xuICAgIHRoaXMub25JbnNlcnRDb25mbGljdCA9IHRoaXMub3B0aW9ucy5vbkluc2VydENvbmZsaWN0O1xuICAgIHRoaXMucm9vdCA9IG51bGw7XG4gIH1cblxuICBpbnNlcnQodmFsdWUpIHtcbiAgICB2YXIgY21wLCBjb21wYXJlLCBsZWZ0T3JSaWdodCwgcGFyZW50O1xuICAgIGNvbXBhcmUgPSB0aGlzLmNvbXBhcmF0b3I7XG4gICAgaWYgKHRoaXMucm9vdCAhPSBudWxsKSB7XG4gICAgICBwYXJlbnQgPSB0aGlzLnJvb3Q7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjbXAgPSBjb21wYXJlKHZhbHVlLCBwYXJlbnQudmFsdWUpO1xuICAgICAgICBpZiAoY21wID09PSAwKSB7XG4gICAgICAgICAgcGFyZW50LnZhbHVlID0gdGhpcy5vbkluc2VydENvbmZsaWN0KHBhcmVudC52YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZWZ0T3JSaWdodCA9IGNtcCA8IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgICAgIGlmIChwYXJlbnRbbGVmdE9yUmlnaHRdID09PSBudWxsKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyZW50ID0gcGFyZW50W2xlZnRPclJpZ2h0XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcmVudFtsZWZ0T3JSaWdodF0gPSBuZXcgTm9kZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJvb3QgPSBuZXcgTm9kZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMucm9vdCA9IGJpbmFyeVRyZWVEZWxldGUodGhpcy5yb290LCB2YWx1ZSwgdGhpcy5jb21wYXJhdG9yKTtcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCaW5hcnlUcmVlU3RyYXRlZ3k7XG4iLCJcbmltcG9ydCBBYnN0cmFjdEJpbmFyeVRyZWVTdHJhdGVneSBmcm9tICcuL0Fic3RyYWN0QmluYXJ5VHJlZVN0cmF0ZWd5JztcblxuLy8gQW4gaW1wbGVtZW50YXRpb24gb2YgTGVmdC1MZWFuaW5nIFJlZC1CbGFjayB0cmVlcy5cblxuLy8gSXQncyBjb3BpZWQgZnJvbSBodHRwOi8vd3d3LmNzLnByaW5jZXRvbi5lZHUvfnJzL3RhbGtzL0xMUkIvTExSQi5wZGYuXG4vLyBJdCdzIHByYWN0aWNhbGx5IGEgY29weS1wYXN0ZSBqb2IsIG1pbnVzIHRoZSBzZW1pY29sb25zLiBtaXNzaW5nIGJpdHMgd2VyZVxuLy8gZmlsbGVkIGluIHdpdGggaGludHMgZnJvbVxuLy8gaHR0cDovL3d3dy50ZWFjaHNvbGFpc2dhbWVzLmNvbS9hcnRpY2xlcy9iYWxhbmNlZF9sZWZ0X2xlYW5pbmcuaHRtbFxuXG4vLyBIZXJlIGFyZSBzb21lIGRpZmZlcmVuY2VzOlxuLy8gKiBUaGlzIGlzbid0IGEgbWFwIHN0cnVjdHVyZTogaXQncyBqdXN0IGEgdHJlZS4gVGhlcmUgYXJlIG5vIGtleXM6IHRoZVxuLy8gICBjb21wYXJhdG9yIGFwcGxpZXMgdG8gdGhlIHZhbHVlcy5cbi8vICogV2UgdXNlIHRoZSBwYXNzZWQgY29tcGFyYXRvci5cbmNsYXNzIE5vZGUge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZTEpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWUxO1xuICAgIHRoaXMubGVmdCA9IG51bGw7XG4gICAgdGhpcy5yaWdodCA9IG51bGw7XG4gICAgdGhpcy5pc1JlZCA9IHRydWU7IC8vIG51bGwgbm9kZXMgLS0gbGVhdmVzIC0tIGFyZSBibGFja1xuICB9XG5cbn07XG5cbmNvbnN0IHJvdGF0ZUxlZnQgPSAoaCkgPT4ge1xuICB2YXIgeDtcbiAgeCA9IGgucmlnaHQ7XG4gIGgucmlnaHQgPSB4LmxlZnQ7XG4gIHgubGVmdCA9IGg7XG4gIHguaXNSZWQgPSBoLmlzUmVkO1xuICBoLmlzUmVkID0gdHJ1ZTtcbiAgcmV0dXJuIHg7XG59O1xuXG5jb25zdCByb3RhdGVSaWdodCA9IChoKSA9PiB7XG4gIHZhciB4O1xuICB4ID0gaC5sZWZ0O1xuICBoLmxlZnQgPSB4LnJpZ2h0O1xuICB4LnJpZ2h0ID0gaDtcbiAgeC5pc1JlZCA9IGguaXNSZWQ7XG4gIGguaXNSZWQgPSB0cnVlO1xuICByZXR1cm4geDtcbn07XG5cbmNvbnN0IGNvbG9yRmxpcCA9IChoKSA9PiB7XG4gIGguaXNSZWQgPSAhaC5pc1JlZDtcbiAgaC5sZWZ0LmlzUmVkID0gIWgubGVmdC5pc1JlZDtcbiAgaC5yaWdodC5pc1JlZCA9ICFoLnJpZ2h0LmlzUmVkO1xuICByZXR1cm4gdm9pZCAwO1xufTtcblxuY29uc3QgbW92ZVJlZExlZnQgPSAoaCkgPT4ge1xuICAvL3Rocm93ICdQcmVjb25kaXRpb25zIGZhaWxlZCcgaWYgISghaC5sZWZ0LmlzUmVkICYmICFoLmxlZnQubGVmdD8uaXNSZWQpXG4gIGNvbG9yRmxpcChoKTtcbiAgaWYgKGgucmlnaHQgIT09IG51bGwgJiYgaC5yaWdodC5sZWZ0ICE9PSBudWxsICYmIGgucmlnaHQubGVmdC5pc1JlZCkge1xuICAgIGgucmlnaHQgPSByb3RhdGVSaWdodChoLnJpZ2h0KTtcbiAgICBoID0gcm90YXRlTGVmdChoKTtcbiAgICBjb2xvckZsaXAoaCk7XG4gIH1cbiAgcmV0dXJuIGg7XG59O1xuXG5jb25zdCBtb3ZlUmVkUmlnaHQgPSAoaCkgPT4ge1xuICAvL3Rocm93ICdQcmVjb25kaXRpb25zIGZhaWxlZCcgaWYgISghaC5yaWdodC5pc1JlZCAmJiAhaC5yaWdodC5sZWZ0Py5pc1JlZClcbiAgY29sb3JGbGlwKGgpO1xuICBpZiAoaC5sZWZ0ICE9PSBudWxsICYmIGgubGVmdC5sZWZ0ICE9PSBudWxsICYmIGgubGVmdC5sZWZ0LmlzUmVkKSB7XG4gICAgaCA9IHJvdGF0ZVJpZ2h0KGgpO1xuICAgIGNvbG9yRmxpcChoKTtcbiAgfVxuICByZXR1cm4gaDtcbn07XG5cbmNvbnN0IGluc2VydEluTm9kZSA9IChoLCB2YWx1ZSwgY29tcGFyZSwgb25JbnNlcnRDb25mbGljdCkgPT4ge1xuICB2YXIgY21wO1xuICBpZiAoaCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgTm9kZSh2YWx1ZSk7XG4gIH1cbiAgLy9pZiBoLmxlZnQgaXNudCBudWxsICYmIGgubGVmdC5pc1JlZCAmJiBoLnJpZ2h0IGlzbnQgbnVsbCAmJiBoLnJpZ2h0LmlzUmVkXG4gIC8vICBjb2xvckZsaXAoaClcbiAgY21wID0gY29tcGFyZSh2YWx1ZSwgaC52YWx1ZSk7XG4gIGlmIChjbXAgPT09IDApIHtcbiAgICBoLnZhbHVlID0gb25JbnNlcnRDb25mbGljdChoLnZhbHVlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoY21wIDwgMCkge1xuICAgIGgubGVmdCA9IGluc2VydEluTm9kZShoLmxlZnQsIHZhbHVlLCBjb21wYXJlLCBvbkluc2VydENvbmZsaWN0KTtcbiAgfSBlbHNlIHtcbiAgICBoLnJpZ2h0ID0gaW5zZXJ0SW5Ob2RlKGgucmlnaHQsIHZhbHVlLCBjb21wYXJlLCBvbkluc2VydENvbmZsaWN0KTtcbiAgfVxuICBpZiAoaC5yaWdodCAhPT0gbnVsbCAmJiBoLnJpZ2h0LmlzUmVkICYmICEoaC5sZWZ0ICE9PSBudWxsICYmIGgubGVmdC5pc1JlZCkpIHtcbiAgICBoID0gcm90YXRlTGVmdChoKTtcbiAgfVxuICBpZiAoaC5sZWZ0ICE9PSBudWxsICYmIGgubGVmdC5pc1JlZCAmJiBoLmxlZnQubGVmdCAhPT0gbnVsbCAmJiBoLmxlZnQubGVmdC5pc1JlZCkge1xuICAgIGggPSByb3RhdGVSaWdodChoKTtcbiAgfVxuICAvLyBQdXQgdGhpcyBoZXJlIC0tIEkgY291bGRuJ3QgZ2V0IHRoZSB3aG9sZSB0aGluZyB0byB3b3JrIG90aGVyd2lzZSA6KFxuICBpZiAoaC5sZWZ0ICE9PSBudWxsICYmIGgubGVmdC5pc1JlZCAmJiBoLnJpZ2h0ICE9PSBudWxsICYmIGgucmlnaHQuaXNSZWQpIHtcbiAgICBjb2xvckZsaXAoaCk7XG4gIH1cbiAgcmV0dXJuIGg7XG59O1xuXG5jb25zdCBmaW5kTWluTm9kZSA9IChoKSA9PiB7XG4gIHdoaWxlIChoLmxlZnQgIT09IG51bGwpIHtcbiAgICBoID0gaC5sZWZ0O1xuICB9XG4gIHJldHVybiBoO1xufTtcblxuY29uc3QgZml4VXAgPSAoaCkgPT4ge1xuICAvLyBGaXggcmlnaHQtbGVhbmluZyByZWQgbm9kZXNcbiAgaWYgKGgucmlnaHQgIT09IG51bGwgJiYgaC5yaWdodC5pc1JlZCkge1xuICAgIGggPSByb3RhdGVMZWZ0KGgpO1xuICB9XG4gIC8vIEhhbmRsZSBhIDQtbm9kZSB0aGF0IHRyYXZlcnNlcyBkb3duIHRoZSBsZWZ0XG4gIGlmIChoLmxlZnQgIT09IG51bGwgJiYgaC5sZWZ0LmlzUmVkICYmIGgubGVmdC5sZWZ0ICE9PSBudWxsICYmIGgubGVmdC5sZWZ0LmlzUmVkKSB7XG4gICAgaCA9IHJvdGF0ZVJpZ2h0KGgpO1xuICB9XG4gIC8vIHNwbGl0IDQtbm9kZXNcbiAgaWYgKGgubGVmdCAhPT0gbnVsbCAmJiBoLmxlZnQuaXNSZWQgJiYgaC5yaWdodCAhPT0gbnVsbCAmJiBoLnJpZ2h0LmlzUmVkKSB7XG4gICAgY29sb3JGbGlwKGgpO1xuICB9XG4gIHJldHVybiBoO1xufTtcblxuY29uc3QgcmVtb3ZlTWluTm9kZSA9IChoKSA9PiB7XG4gIGlmIChoLmxlZnQgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoIWgubGVmdC5pc1JlZCAmJiAhKGgubGVmdC5sZWZ0ICE9PSBudWxsICYmIGgubGVmdC5sZWZ0LmlzUmVkKSkge1xuICAgIGggPSBtb3ZlUmVkTGVmdChoKTtcbiAgfVxuICBoLmxlZnQgPSByZW1vdmVNaW5Ob2RlKGgubGVmdCk7XG4gIHJldHVybiBmaXhVcChoKTtcbn07XG5cbmNvbnN0IHJlbW92ZUZyb21Ob2RlID0gKGgsIHZhbHVlLCBjb21wYXJlKSA9PiB7XG4gIGlmIChoID09PSBudWxsKSB7XG4gICAgdGhyb3cgJ1ZhbHVlIG5vdCBpbiBzZXQnO1xuICB9XG4gIGlmIChoLnZhbHVlICE9PSB2YWx1ZSAmJiBjb21wYXJlKHZhbHVlLCBoLnZhbHVlKSA8IDApIHtcbiAgICBpZiAoaC5sZWZ0ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyAnVmFsdWUgbm90IGluIHNldCc7XG4gICAgfVxuICAgIGlmICghaC5sZWZ0LmlzUmVkICYmICEoaC5sZWZ0LmxlZnQgIT09IG51bGwgJiYgaC5sZWZ0LmxlZnQuaXNSZWQpKSB7XG4gICAgICBoID0gbW92ZVJlZExlZnQoaCk7XG4gICAgfVxuICAgIGgubGVmdCA9IHJlbW92ZUZyb21Ob2RlKGgubGVmdCwgdmFsdWUsIGNvbXBhcmUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoLmxlZnQgIT09IG51bGwgJiYgaC5sZWZ0LmlzUmVkKSB7XG4gICAgICBoID0gcm90YXRlUmlnaHQoaCk7XG4gICAgfVxuICAgIGlmIChoLnJpZ2h0ID09PSBudWxsKSB7XG4gICAgICBpZiAodmFsdWUgPT09IGgudmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIGxlYWYgbm9kZTsgTExSQiBhc3N1cmVzIG5vIGxlZnQgdmFsdWUgaGVyZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ1ZhbHVlIG5vdCBpbiBzZXQnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWgucmlnaHQuaXNSZWQgJiYgIShoLnJpZ2h0LmxlZnQgIT09IG51bGwgJiYgaC5yaWdodC5sZWZ0LmlzUmVkKSkge1xuICAgICAgaCA9IG1vdmVSZWRSaWdodChoKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSBoLnZhbHVlKSB7XG4gICAgICBoLnZhbHVlID0gZmluZE1pbk5vZGUoaC5yaWdodCkudmFsdWU7XG4gICAgICBoLnJpZ2h0ID0gcmVtb3ZlTWluTm9kZShoLnJpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaC5yaWdodCA9IHJlbW92ZUZyb21Ob2RlKGgucmlnaHQsIHZhbHVlLCBjb21wYXJlKTtcbiAgICB9XG4gIH1cbiAgaWYgKGggIT09IG51bGwpIHtcbiAgICBoID0gZml4VXAoaCk7XG4gIH1cbiAgcmV0dXJuIGg7XG59O1xuXG5jbGFzcyBSZWRCbGFja1RyZWVTdHJhdGVneSBleHRlbmRzIEFic3RyYWN0QmluYXJ5VHJlZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmNvbXBhcmF0b3IgPSB0aGlzLm9wdGlvbnMuY29tcGFyYXRvcjtcbiAgICB0aGlzLm9uSW5zZXJ0Q29uZmxpY3QgPSB0aGlzLm9wdGlvbnMub25JbnNlcnRDb25mbGljdDtcbiAgICB0aGlzLnJvb3QgPSBudWxsO1xuICB9XG5cbiAgaW5zZXJ0KHZhbHVlKSB7XG4gICAgdGhpcy5yb290ID0gaW5zZXJ0SW5Ob2RlKHRoaXMucm9vdCwgdmFsdWUsIHRoaXMuY29tcGFyYXRvciwgdGhpcy5vbkluc2VydENvbmZsaWN0KTtcbiAgICB0aGlzLnJvb3QuaXNSZWQgPSBmYWxzZTsgLy8gYWx3YXlzXG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuXG4gIHJlbW92ZSh2YWx1ZSkge1xuICAgIHRoaXMucm9vdCA9IHJlbW92ZUZyb21Ob2RlKHRoaXMucm9vdCwgdmFsdWUsIHRoaXMuY29tcGFyYXRvcik7XG4gICAgaWYgKHRoaXMucm9vdCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5yb290LmlzUmVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgUmVkQmxhY2tUcmVlU3RyYXRlZ3k7XG4iLCJcbmNvbnN0IHRocm93XyA9IChvbGRWYWx1ZSwgbmV3VmFsdWUpID0+IHtcbiAgdGhyb3cgJ1ZhbHVlIGFscmVhZHkgaW4gc2V0Jztcbn07XG5cbmV4cG9ydCB7IHRocm93XyBhcyB0aHJvdyB9O1xuXG5leHBvcnQgY29uc3QgcmVwbGFjZSA9IChvbGRWYWx1ZSwgbmV3VmFsdWUpID0+IHtcbiAgcmV0dXJuIG5ld1ZhbHVlO1xufTtcblxuZXhwb3J0IGNvbnN0IGlnbm9yZSA9IChvbGRWYWx1ZSwgbmV3VmFsdWUpID0+IHtcbiAgcmV0dXJuIG9sZFZhbHVlO1xufTtcblxuIiwiXG5pbXBvcnQgQWJzdHJhY3RTb3J0ZWRTZXQgZnJvbSAnLi9Tb3J0ZWRTZXQvQWJzdHJhY3RTb3J0ZWRTZXQnO1xuaW1wb3J0IEFycmF5U3RyYXRlZ3kgZnJvbSAnLi9Tb3J0ZWRTZXQvQXJyYXlTdHJhdGVneSc7XG5pbXBvcnQgQmluYXJ5VHJlZVN0cmF0ZWd5IGZyb20gJy4vU29ydGVkU2V0L0JpbmFyeVRyZWVTdHJhdGVneSc7XG5pbXBvcnQgUmVkQmxhY2tUcmVlU3RyYXRlZ3kgZnJvbSAnLi9Tb3J0ZWRTZXQvUmVkQmxhY2tUcmVlU3RyYXRlZ3knO1xuaW1wb3J0ICogYXMgaW5zZXJ0Q29uZmxpY3RSZXNvbHZlcnMgZnJvbSAnLi9pbnNlcnRDb25mbGljdFJlc29sdmVycyc7XG5cbmNsYXNzIFNvcnRlZFNldCBleHRlbmRzIEFic3RyYWN0U29ydGVkU2V0IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgb3B0aW9ucy5zdHJhdGVneSB8fCAob3B0aW9ucy5zdHJhdGVneSA9IFJlZEJsYWNrVHJlZVN0cmF0ZWd5KTtcbiAgICBvcHRpb25zLmNvbXBhcmF0b3IgfHwgKG9wdGlvbnMuY29tcGFyYXRvciA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiAoYSB8fCAwKSAtIChiIHx8IDApO1xuICAgIH0pO1xuICAgIG9wdGlvbnMub25JbnNlcnRDb25mbGljdCB8fCAob3B0aW9ucy5vbkluc2VydENvbmZsaWN0ID0gaW5zZXJ0Q29uZmxpY3RSZXNvbHZlcnMudGhyb3cpO1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG59O1xuXG5Tb3J0ZWRTZXQuQXJyYXlTdHJhdGVneSA9IEFycmF5U3RyYXRlZ3k7XG5Tb3J0ZWRTZXQuQmluYXJ5VHJlZVN0cmF0ZWd5ID0gQmluYXJ5VHJlZVN0cmF0ZWd5O1xuU29ydGVkU2V0LlJlZEJsYWNrVHJlZVN0cmF0ZWd5ID0gUmVkQmxhY2tUcmVlU3RyYXRlZ3k7XG5cblNvcnRlZFNldC5Pbkluc2VydENvbmZsaWN0VGhyb3cgPSBpbnNlcnRDb25mbGljdFJlc29sdmVycy50aHJvdztcblNvcnRlZFNldC5Pbkluc2VydENvbmZsaWN0UmVwbGFjZSA9IGluc2VydENvbmZsaWN0UmVzb2x2ZXJzLnJlcGxhY2U7XG5Tb3J0ZWRTZXQuT25JbnNlcnRDb25mbGljdElnbm9yZSA9IGluc2VydENvbmZsaWN0UmVzb2x2ZXJzLmlnbm9yZTtcblxuZXhwb3J0IGRlZmF1bHQgU29ydGVkU2V0O1xuXG4iXSwibmFtZXMiOlsiQWJzdHJhY3RCaW5hcnlUcmVlU3RyYXRlZ3kiLCJOb2RlIiwiaW5zZXJ0Q29uZmxpY3RSZXNvbHZlcnMudGhyb3ciLCJpbnNlcnRDb25mbGljdFJlc29sdmVycy5yZXBsYWNlIiwiaW5zZXJ0Q29uZmxpY3RSZXNvbHZlcnMuaWdub3JlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7RUFDQSxNQUFNLGlCQUFpQixDQUFDO0VBQ3hCLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRTtFQUN2QixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO0VBQy9ELE1BQU0sTUFBTSx3Q0FBd0MsQ0FBQztFQUNyRCxLQUFLO0VBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtFQUNqRSxNQUFNLE1BQU0sNENBQTRDLENBQUM7RUFDekQsS0FBSztFQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtFQUN2RSxNQUFNLE1BQU0sZ0RBQWdELENBQUM7RUFDN0QsS0FBSztFQUNMLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDOUMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztFQUNwQixHQUFHO0FBQ0g7RUFDQSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUU7RUFDaEIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUM1QixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0VB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
