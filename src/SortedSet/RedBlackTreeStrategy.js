
import AbstractBinaryTreeStrategy from './AbstractBinaryTreeStrategy';

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

};

const rotateLeft = (h) => {
  const x = h.right;
  h.right = x.left;
  x.left = h;
  x.isRed = h.isRed;
  h.isRed = true;
  return x;
};

const rotateRight = (h) => {
  const x = h.left;
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

class RedBlackTreeStrategy extends AbstractBinaryTreeStrategy {
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

};

export default RedBlackTreeStrategy;
