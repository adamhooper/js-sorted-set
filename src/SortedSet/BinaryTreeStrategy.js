import AbstractBinaryTreeStrategy from './AbstractBinaryTreeStrategy';

class Node {
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

class BinaryTreeStrategy extends AbstractBinaryTreeStrategy {
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
      return parent[leftOrRight] = new Node(value);
    } else {
      return this.root = new Node(value);
    }
  }

  remove(value) {
    return this.root = binaryTreeDelete(this.root, value, this.comparator);
  }

};

export default BinaryTreeStrategy;
