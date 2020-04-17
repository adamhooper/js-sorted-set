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

};

BinaryTreeIterator.find = function(tree, value, comparator) {
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

BinaryTreeIterator.left = (tree) => {
  if (tree.root === null) {
    return new BinaryTreeIterator(tree, null);
  } else {
    tree.root._iteratorParentNode = null;
    const node = descendAllTheWay('left', tree.root);
    return new BinaryTreeIterator(tree, node);
  }
};

BinaryTreeIterator.right = (tree) => {
  return new BinaryTreeIterator(tree, null);
};

export default BinaryTreeIterator;
