(function() {
  define([], function() {
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
    return BinaryTreeIterator;
  });

}).call(this);

/*
//@ sourceMappingURL=BinaryTreeIterator.js.map
*/