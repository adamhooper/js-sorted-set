(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["sorted-set"] = factory());
})(this, (function () { 'use strict';

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
      const ret = [];
      this.forEach(function (value, index, self) {
        return ret.push(callback.call(thisArg, value, index, self));
      });
      return ret;
    }
    filter(callback, thisArg) {
      const ret = [];
      this.forEach(function (value, index, self) {
        if (callback.call(thisArg, value, index, self)) {
          return ret.push(value);
        }
      });
      return ret;
    }
    every(callback, thisArg) {
      let ret = true;
      this.forEach(function (value, index, self) {
        if (ret && !callback.call(thisArg, value, index, self)) {
          ret = false;
        }
      });
      return ret;
    }
    some(callback, thisArg) {
      let ret = false;
      this.forEach(function (value, index, self) {
        if (!ret && callback.call(thisArg, value, index, self)) {
          ret = true;
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
    let low = 0;
    let high = array.length;
    while (low < high) {
      const mid = low + high >>> 1;
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
      const index = binarySearchForIndex(this.data, value, this.comparator);
      if (this.data[index] !== void 0 && this.comparator(this.data[index], value) === 0) {
        return this.data.splice(index, 1, this.onInsertConflict(this.data[index], value));
      } else {
        return this.data.splice(index, 0, value);
      }
    }
    remove(value) {
      const index = binarySearchForIndex(this.data, value, this.comparator);
      if (this.comparator(this.data[index], value) !== 0) {
        throw 'Value not in set';
      }
      return this.data.splice(index, 1);
    }
    clear() {
      return this.data.length = 0;
    }
    contains(value) {
      const index = binarySearchForIndex(this.data, value, this.comparator);
      return this.index !== this.data.length && this.comparator(this.data[index], value) === 0;
    }
    forEachImpl(callback, sortedSet, thisArg) {
      const data = this.data;
      const len = data.length;
      for (let i = 0; i < len; i++) {
        callback.call(thisArg, data[i], i, sortedSet);
      }
    }
    findIterator(value) {
      const index = binarySearchForIndex(this.data, value, this.comparator);
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
    // Assumes node._iteratorParentNode is set
    while (node[leftOrRight] !== null) {
      const parent = node;
      node = node[leftOrRight];
      node._iteratorParentNode = parent;
    }
    return node;
  };
  const moveCursor = (leftOrRight, node) => {
    let parent, rightOrLeft;
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
      if (this.node === null) {
        return null;
      } else {
        const node = moveCursor('right', this.node);
        return new BinaryTreeIterator(this.tree, node);
      }
    }
    previous() {
      if (this.node === null) {
        if (this.tree.root === null) {
          return null;
        } else {
          this.tree.root._iteratorParentNode = null;
          const node = descendAllTheWay('right', this.tree.root);
          return new BinaryTreeIterator(this.tree, node);
        }
      } else {
        const node = moveCursor('left', this.node);
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
  BinaryTreeIterator.find = function (tree, value, comparator) {
    const root = tree.root;
    if (root != null) {
      root._iteratorParentNode = null;
    }
    let node = root;
    let nextNode = null; // For finding an in-between node
    while (node !== null) {
      const cmp = comparator(value, node.value);
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
  BinaryTreeIterator.left = tree => {
    if (tree.root === null) {
      return new BinaryTreeIterator(tree, null);
    } else {
      tree.root._iteratorParentNode = null;
      const node = descendAllTheWay('left', tree.root);
      return new BinaryTreeIterator(tree, node);
    }
  };
  BinaryTreeIterator.right = tree => {
    return new BinaryTreeIterator(tree, null);
  };

  const binaryTreeTraverse = (node, callback) => {
    if (node !== null) {
      binaryTreeTraverse(node.left, callback);
      callback(node.value);
      binaryTreeTraverse(node.right, callback);
    }
  };

  // An AbstractBinaryTree has a @root. @root is null or an object with
  // `.left`, `.right` and `.value` properties.
  class AbstractBinaryTree {
    toArray() {
      const ret = [];
      binaryTreeTraverse(this.root, function (value) {
        return ret.push(value);
      });
      return ret;
    }
    clear() {
      return this.root = null;
    }
    forEachImpl(callback, sortedSet, thisArg) {
      let i = 0;
      binaryTreeTraverse(this.root, function (value) {
        callback.call(thisArg, value, i, sortedSet);
        i += 1;
      });
    }
    contains(value) {
      const comparator = this.comparator;
      let node = this.root;
      while (node !== null) {
        const cmp = comparator(value, node.value);
        if (cmp === 0) {
          break;
        } else if (cmp < 0) {
          node = node.left;
        } else {
          node = node.right;
        }
      }
      return node !== null && comparator(node.value, value) === 0;
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

  let Node$1 = class Node {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
    }
  };
  const nodeAllTheWay = (node, leftOrRight) => {
    while (node[leftOrRight] !== null) {
      node = node[leftOrRight];
    }
    return node;
  };

  // Returns the subtree, minus value
  const binaryTreeDelete = (node, value, comparator) => {
    if (node === null) {
      throw 'Value not in set';
    }
    const cmp = comparator(value, node.value);
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
        const nextNode = nodeAllTheWay(node.right, 'left');
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
      const compare = this.comparator;
      if (this.root !== null) {
        let parent = this.root;
        let leftOrRight = null;
        while (true) {
          const cmp = compare(value, parent.value);
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
        return parent[leftOrRight] = new Node$1(value);
      } else {
        return this.root = new Node$1(value);
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
  class Node {
    constructor(value1) {
      this.value = value1;
      this.left = null;
      this.right = null;
      this.isRed = true; // null nodes -- leaves -- are black
    }
  }
  const rotateLeft = h => {
    const x = h.right;
    h.right = x.left;
    x.left = h;
    x.isRed = h.isRed;
    h.isRed = true;
    return x;
  };
  const rotateRight = h => {
    const x = h.left;
    h.left = x.right;
    x.right = h;
    x.isRed = h.isRed;
    h.isRed = true;
    return x;
  };
  const colorFlip = h => {
    h.isRed = !h.isRed;
    h.left.isRed = !h.left.isRed;
    h.right.isRed = !h.right.isRed;
  };
  const moveRedLeft = h => {
    //throw 'Preconditions failed' if !(!h.left.isRed && !h.left.left?.isRed)
    colorFlip(h);
    if (h.right !== null && h.right.left !== null && h.right.left.isRed) {
      h.right = rotateRight(h.right);
      h = rotateLeft(h);
      colorFlip(h);
    }
    return h;
  };
  const moveRedRight = h => {
    //throw 'Preconditions failed' if !(!h.right.isRed && !h.right.left?.isRed)
    colorFlip(h);
    if (h.left !== null && h.left.left !== null && h.left.left.isRed) {
      h = rotateRight(h);
      colorFlip(h);
    }
    return h;
  };
  const insertInNode = (h, value, compare, onInsertConflict) => {
    if (h === null) {
      return new Node(value);
    }
    //if h.left isnt null && h.left.isRed && h.right isnt null && h.right.isRed
    //  colorFlip(h)
    const cmp = compare(value, h.value);
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
  const findMinNode = h => {
    while (h.left !== null) {
      h = h.left;
    }
    return h;
  };
  const fixUp = h => {
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
  const removeMinNode = h => {
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
    if (compare(value, h.value) < 0) {
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
        if (compare(value, h.value) === 0) {
          return null; // leaf node; LLRB assures no left value here
        } else {
          throw 'Value not in set';
        }
      }
      if (!h.right.isRed && !(h.right.left !== null && h.right.left.isRed)) {
        h = moveRedRight(h);
      }
      if (compare(value, h.value) === 0) {
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
    }
    remove(value) {
      this.root = removeFromNode(this.root, value, this.comparator);
      if (this.root !== null) {
        this.root.isRed = false;
      }
    }
  }

  const InsertConflictResolvers = {
    OnInsertConflictThrow: (oldValue, newValue) => {
      throw new Error("Value already in set");
    },
    OnInsertConflictReplace: (oldValue, newValue) => newValue,
    OnInsertConflictIgnore: (oldValue, newValue) => oldValue
  };

  class SortedSet extends AbstractSortedSet {
    constructor(options) {
      options || (options = {});
      options.strategy || (options.strategy = RedBlackTreeStrategy);
      options.comparator || (options.comparator = function (a, b) {
        return (a || 0) - (b || 0);
      });
      options.onInsertConflict || (options.onInsertConflict = InsertConflictResolvers.OnInsertConflictThrow);
      super(options);
    }
  }
  SortedSet.ArrayStrategy = ArrayStrategy;
  SortedSet.BinaryTreeStrategy = BinaryTreeStrategy;
  SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy;
  Object.assign(SortedSet, InsertConflictResolvers);

  return SortedSet;

}));
//# sourceMappingURL=sorted-set.js.map
