!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SortedSet=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var AbstractSortedSet, ArrayStrategy, BinaryTreeStrategy, RedBlackTreeStrategy, SortedSet,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AbstractSortedSet = _dereq_('./SortedSet/AbstractSortedSet');

ArrayStrategy = _dereq_('./SortedSet/ArrayStrategy');

BinaryTreeStrategy = _dereq_('./SortedSet/BinaryTreeStrategy');

RedBlackTreeStrategy = _dereq_('./SortedSet/RedBlackTreeStrategy');

SortedSet = (function(_super) {
  __extends(SortedSet, _super);

  function SortedSet(options) {
    options || (options = {});
    options.strategy || (options.strategy = RedBlackTreeStrategy);
    options.comparator || (options.comparator = function(a, b) {
      return (a || 0) - (b || 0);
    });
    SortedSet.__super__.constructor.call(this, options);
  }

  return SortedSet;

})(AbstractSortedSet);

SortedSet.ArrayStrategy = ArrayStrategy;

SortedSet.BinaryTreeStrategy = BinaryTreeStrategy;

SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy;

module.exports = SortedSet;



},{"./SortedSet/AbstractSortedSet":3,"./SortedSet/ArrayStrategy":4,"./SortedSet/BinaryTreeStrategy":6,"./SortedSet/RedBlackTreeStrategy":7}],2:[function(_dereq_,module,exports){
var AbstractBinaryTree, BinaryTreeIterator, binaryTreeTraverse;

BinaryTreeIterator = _dereq_('./BinaryTreeIterator');

binaryTreeTraverse = function(node, callback) {
  if (node !== null) {
    binaryTreeTraverse(node.left, callback);
    callback(node.value);
    binaryTreeTraverse(node.right, callback);
  }
  return void 0;
};

AbstractBinaryTree = (function() {
  function AbstractBinaryTree() {}

  AbstractBinaryTree.prototype.toArray = function() {
    var ret;
    ret = [];
    binaryTreeTraverse(this.root, function(value) {
      return ret.push(value);
    });
    return ret;
  };

  AbstractBinaryTree.prototype.forEachImpl = function(callback, sortedSet, thisArg) {
    var i;
    i = 0;
    binaryTreeTraverse(this.root, function(value) {
      callback.call(thisArg, value, i, sortedSet);
      return i += 1;
    });
    return void 0;
  };

  AbstractBinaryTree.prototype.contains = function(value) {
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
  };

  AbstractBinaryTree.prototype.findIterator = function(value) {
    return BinaryTreeIterator.find(this, value, this.comparator);
  };

  AbstractBinaryTree.prototype.beginIterator = function() {
    return BinaryTreeIterator.left(this);
  };

  AbstractBinaryTree.prototype.endIterator = function() {
    return BinaryTreeIterator.right(this);
  };

  return AbstractBinaryTree;

})();

module.exports = AbstractBinaryTree;



},{"./BinaryTreeIterator":5}],3:[function(_dereq_,module,exports){
var AbstractSortedSet;

module.exports = AbstractSortedSet = (function() {
  function AbstractSortedSet(options) {
    if ((options != null ? options.strategy : void 0) == null) {
      throw 'Must pass options.strategy, a strategy';
    }
    if ((options != null ? options.comparator : void 0) == null) {
      throw 'Must pass options.comparator, a comparator';
    }
    this.priv = new options.strategy(options);
    this.length = 0;
  }

  AbstractSortedSet.prototype.insert = function(value) {
    this.priv.insert(value);
    this.length += 1;
    return this;
  };

  AbstractSortedSet.prototype.remove = function(value) {
    this.priv.remove(value);
    this.length -= 1;
    return this;
  };

  AbstractSortedSet.prototype.contains = function(value) {
    return this.priv.contains(value);
  };

  AbstractSortedSet.prototype.toArray = function() {
    return this.priv.toArray();
  };

  AbstractSortedSet.prototype.forEach = function(callback, thisArg) {
    this.priv.forEachImpl(callback, this, thisArg);
    return this;
  };

  AbstractSortedSet.prototype.map = function(callback, thisArg) {
    var ret;
    ret = [];
    this.forEach(function(value, index, self) {
      return ret.push(callback.call(thisArg, value, index, self));
    });
    return ret;
  };

  AbstractSortedSet.prototype.filter = function(callback, thisArg) {
    var ret;
    ret = [];
    this.forEach(function(value, index, self) {
      if (callback.call(thisArg, value, index, self)) {
        return ret.push(value);
      }
    });
    return ret;
  };

  AbstractSortedSet.prototype.every = function(callback, thisArg) {
    var ret;
    ret = true;
    this.forEach(function(value, index, self) {
      if (ret && !callback.call(thisArg, value, index, self)) {
        return ret = false;
      }
    });
    return ret;
  };

  AbstractSortedSet.prototype.some = function(callback, thisArg) {
    var ret;
    ret = false;
    this.forEach(function(value, index, self) {
      if (!ret && callback.call(thisArg, value, index, self)) {
        return ret = true;
      }
    });
    return ret;
  };

  AbstractSortedSet.prototype.findIterator = function(value) {
    return this.priv.findIterator(value);
  };

  AbstractSortedSet.prototype.beginIterator = function() {
    return this.priv.beginIterator();
  };

  AbstractSortedSet.prototype.endIterator = function() {
    return this.priv.endIterator();
  };

  return AbstractSortedSet;

})();



},{}],4:[function(_dereq_,module,exports){
var ArrayStrategy, Iterator, binarySearchForIndex;

Iterator = (function() {
  function Iterator(priv, index) {
    this.priv = priv;
    this.index = index;
    this.data = this.priv.data;
  }

  Iterator.prototype.hasNext = function() {
    return this.index < this.data.length;
  };

  Iterator.prototype.hasPrevious = function() {
    return this.index > 0;
  };

  Iterator.prototype.value = function() {
    if (this.index < this.data.length) {
      return this.data[this.index];
    } else {
      return null;
    }
  };

  Iterator.prototype.setValue = function(value) {
    if (!this.priv.options.allowSetValue) {
      throw 'Must set options.allowSetValue';
    }
    if (!this.hasNext()) {
      throw 'Cannot set value at end of set';
    }
    return this.data[this.index] = value;
  };

  Iterator.prototype.next = function() {
    if (this.index >= this.data.length) {
      return null;
    } else {
      return new Iterator(this.priv, this.index + 1);
    }
  };

  Iterator.prototype.previous = function() {
    if (this.index <= 0) {
      return null;
    } else {
      return new Iterator(this.priv, this.index - 1);
    }
  };

  return Iterator;

})();

binarySearchForIndex = function(array, value, comparator) {
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

ArrayStrategy = (function() {
  function ArrayStrategy(options) {
    this.options = options;
    this.comparator = this.options.comparator;
    this.data = [];
  }

  ArrayStrategy.prototype.toArray = function() {
    return this.data;
  };

  ArrayStrategy.prototype.insert = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    if (this.data[index] === value) {
      throw 'Value already in set';
    }
    return this.data.splice(index, 0, value);
  };

  ArrayStrategy.prototype.remove = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    if (this.data[index] !== value) {
      throw 'Value not in set';
    }
    return this.data.splice(index, 1);
  };

  ArrayStrategy.prototype.contains = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    return this.index !== this.data.length && this.data[index] === value;
  };

  ArrayStrategy.prototype.forEachImpl = function(callback, sortedSet, thisArg) {
    var index, value, _i, _len, _ref;
    _ref = this.data;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      value = _ref[index];
      callback.call(thisArg, value, index, sortedSet);
    }
    return void 0;
  };

  ArrayStrategy.prototype.findIterator = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    return new Iterator(this, index);
  };

  ArrayStrategy.prototype.beginIterator = function() {
    return new Iterator(this, 0);
  };

  ArrayStrategy.prototype.endIterator = function() {
    return new Iterator(this, this.data.length);
  };

  return ArrayStrategy;

})();

module.exports = ArrayStrategy;



},{}],5:[function(_dereq_,module,exports){
var BinaryTreeIterator, descendAllTheWay, moveCursor;

descendAllTheWay = function(leftOrRight, node) {
  var parent;
  while (node[leftOrRight] !== null) {
    parent = node;
    node = node[leftOrRight];
    node._iteratorParentNode = parent;
  }
  return node;
};

moveCursor = function(leftOrRight, node) {
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
    node = parent;
  }
  return node;
};

BinaryTreeIterator = (function() {
  function BinaryTreeIterator(tree, node) {
    this.tree = tree;
    this.node = node;
  }

  BinaryTreeIterator.prototype.next = function() {
    var node;
    if (this.node === null) {
      return null;
    } else {
      node = moveCursor('right', this.node);
      return new BinaryTreeIterator(this.tree, node);
    }
  };

  BinaryTreeIterator.prototype.previous = function() {
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
  };

  BinaryTreeIterator.prototype.hasNext = function() {
    return this.node !== null;
  };

  BinaryTreeIterator.prototype.hasPrevious = function() {
    return this.previous() !== null;
  };

  BinaryTreeIterator.prototype.value = function() {
    if (this.node === null) {
      return null;
    } else {
      return this.node.value;
    }
  };

  BinaryTreeIterator.prototype.setValue = function(value) {
    if (!this.tree.options.allowSetValue) {
      throw 'Must set options.allowSetValue';
    }
    if (!this.hasNext()) {
      throw 'Cannot set value at end of set';
    }
    return this.node.value = value;
  };

  return BinaryTreeIterator;

})();

BinaryTreeIterator.find = function(tree, value, comparator) {
  var cmp, nextNode, node, root;
  root = tree.root;
  if (root != null) {
    root._iteratorParentNode = null;
  }
  node = root;
  nextNode = null;
  while (node !== null) {
    cmp = comparator(value, node.value);
    if (cmp === 0) {
      break;
    } else if (cmp < 0) {
      if (node.left === null) {
        break;
      }
      nextNode = node;
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

BinaryTreeIterator.left = function(tree) {
  var node;
  if (tree.root === null) {
    return new BinaryTreeIterator(tree, null);
  } else {
    tree.root._iteratorParentNode = null;
    node = descendAllTheWay('left', tree.root);
    return new BinaryTreeIterator(tree, node);
  }
};

BinaryTreeIterator.right = function(tree) {
  return new BinaryTreeIterator(tree, null);
};

module.exports = BinaryTreeIterator;



},{}],6:[function(_dereq_,module,exports){
var AbstractBinaryTreeStrategy, BinaryTreeStrategy, Node, binaryTreeDelete, nodeAllTheWay,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AbstractBinaryTreeStrategy = _dereq_('./AbstractBinaryTreeStrategy');

Node = (function() {
  function Node(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }

  return Node;

})();

nodeAllTheWay = function(node, leftOrRight) {
  while (node[leftOrRight] !== null) {
    node = node[leftOrRight];
  }
  return node;
};

binaryTreeDelete = function(node, value, comparator) {
  var cmp, nextNode;
  if (node === null) {
    throw 'Value not in set';
  }
  cmp = comparator(value, node.value);
  if (cmp < 0) {
    node.left = binaryTreeDelete(node.left, value, comparator);
  } else if (cmp > 0) {
    node.right = binaryTreeDelete(node.right, value, comparator);
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

BinaryTreeStrategy = (function(_super) {
  __extends(BinaryTreeStrategy, _super);

  function BinaryTreeStrategy(options) {
    this.options = options;
    this.comparator = this.options.comparator;
    this.root = null;
  }

  BinaryTreeStrategy.prototype.insert = function(value) {
    var cmp, compare, leftOrRight, parent;
    compare = this.comparator;
    if (this.root != null) {
      parent = this.root;
      while (true) {
        cmp = compare(value, parent.value);
        if (cmp === 0) {
          throw 'Value already in set';
        }
        leftOrRight = cmp < 0 ? 'left' : 'right';
        if (parent[leftOrRight] === null) {
          break;
        }
        parent = parent[leftOrRight];
      }
      return parent[leftOrRight] = new Node(value);
    } else {
      return this.root = new Node(value);
    }
  };

  BinaryTreeStrategy.prototype.remove = function(value) {
    return this.root = binaryTreeDelete(this.root, value, this.comparator);
  };

  return BinaryTreeStrategy;

})(AbstractBinaryTreeStrategy);

module.exports = BinaryTreeStrategy;



},{"./AbstractBinaryTreeStrategy":2}],7:[function(_dereq_,module,exports){
var AbstractBinaryTreeStrategy, Node, RedBlackTreeStrategy, colorFlip, findMinNode, fixUp, insertInNode, moveRedLeft, moveRedRight, removeFromNode, removeMinNode, rotateLeft, rotateRight,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AbstractBinaryTreeStrategy = _dereq_('./AbstractBinaryTreeStrategy');

Node = (function() {
  function Node(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.isRed = true;
  }

  return Node;

})();

rotateLeft = function(h) {
  var x;
  x = h.right;
  h.right = x.left;
  x.left = h;
  x.isRed = h.isRed;
  h.isRed = true;
  return x;
};

rotateRight = function(h) {
  var x;
  x = h.left;
  h.left = x.right;
  x.right = h;
  x.isRed = h.isRed;
  h.isRed = true;
  return x;
};

colorFlip = function(h) {
  h.isRed = !h.isRed;
  h.left.isRed = !h.left.isRed;
  h.right.isRed = !h.right.isRed;
  return void 0;
};

moveRedLeft = function(h) {
  colorFlip(h);
  if (h.right !== null && h.right.left !== null && h.right.left.isRed) {
    h.right = rotateRight(h.right);
    h = rotateLeft(h);
    colorFlip(h);
  }
  return h;
};

moveRedRight = function(h) {
  colorFlip(h);
  if (h.left !== null && h.left.left !== null && h.left.left.isRed) {
    h = rotateRight(h);
    colorFlip(h);
  }
  return h;
};

insertInNode = function(h, value, compare) {
  if (h === null) {
    return new Node(value);
  }
  if (h.value === value) {
    throw 'Value already in set';
  } else {
    if (compare(value, h.value) < 0) {
      h.left = insertInNode(h.left, value, compare);
    } else {
      h.right = insertInNode(h.right, value, compare);
    }
  }
  if (h.right !== null && h.right.isRed && !(h.left !== null && h.left.isRed)) {
    h = rotateLeft(h);
  }
  if (h.left !== null && h.left.isRed && h.left.left !== null && h.left.left.isRed) {
    h = rotateRight(h);
  }
  if (h.left !== null && h.left.isRed && h.right !== null && h.right.isRed) {
    colorFlip(h);
  }
  return h;
};

findMinNode = function(h) {
  while (h.left !== null) {
    h = h.left;
  }
  return h;
};

fixUp = function(h) {
  if (h.right !== null && h.right.isRed) {
    h = rotateLeft(h);
  }
  if (h.left !== null && h.left.isRed && h.left.left !== null && h.left.left.isRed) {
    h = rotateRight(h);
  }
  if (h.left !== null && h.left.isRed && h.right !== null && h.right.isRed) {
    colorFlip(h);
  }
  return h;
};

removeMinNode = function(h) {
  if (h.left === null) {
    return null;
  }
  if (!h.left.isRed && !(h.left.left !== null && h.left.left.isRed)) {
    h = moveRedLeft(h);
  }
  h.left = removeMinNode(h.left);
  return fixUp(h);
};

removeFromNode = function(h, value, compare) {
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
        return null;
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

module.exports = RedBlackTreeStrategy = (function(_super) {
  __extends(RedBlackTreeStrategy, _super);

  function RedBlackTreeStrategy(options) {
    this.options = options;
    this.comparator = this.options.comparator;
    this.root = null;
  }

  RedBlackTreeStrategy.prototype.insert = function(value) {
    this.root = insertInNode(this.root, value, this.comparator);
    this.root.isRed = false;
    return void 0;
  };

  RedBlackTreeStrategy.prototype.remove = function(value) {
    this.root = removeFromNode(this.root, value, this.comparator);
    if (this.root !== null) {
      this.root.isRed = false;
    }
    return void 0;
  };

  return RedBlackTreeStrategy;

})(AbstractBinaryTreeStrategy);



},{"./AbstractBinaryTreeStrategy":2}]},{},[1])(1)
});