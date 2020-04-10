"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _BinaryTreeIterator = _interopRequireDefault(require("./BinaryTreeIterator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const binaryTreeTraverse = (node, callback) => {
  if (node !== null) {
    binaryTreeTraverse(node.left, callback);
    callback(node.value);
    binaryTreeTraverse(node.right, callback);
  }

  return void 0;
}; // An AbstractBinaryTree has a @root. @root is null or an object with
// `.left`, `.right` and `.value` properties.


class AbstractBinaryTree {
  toArray() {
    var ret;
    ret = [];
    binaryTreeTraverse(this.root, function (value) {
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
    binaryTreeTraverse(this.root, function (value) {
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
    return _BinaryTreeIterator.default.find(this, value, this.comparator);
  }

  beginIterator() {
    return _BinaryTreeIterator.default.left(this);
  }

  endIterator() {
    return _BinaryTreeIterator.default.right(this);
  }

}

;
var _default = AbstractBinaryTree;
exports.default = _default;
module.exports = exports.default;