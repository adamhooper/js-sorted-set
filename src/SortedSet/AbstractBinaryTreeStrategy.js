
import BinaryTreeIterator from './BinaryTreeIterator';

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
    binaryTreeTraverse(this.root, function(value) {
      return ret.push(value);
    });
    return ret;
  }

  clear() {
    return this.root = null;
  }

  forEachImpl(callback, sortedSet, thisArg) {
    let i = 0;
    binaryTreeTraverse(this.root, function(value) {
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

};

export default AbstractBinaryTree;

