(function() {
  define(['./BinaryTreeIterator'], function(BinaryTreeIterator) {
    var AbstractBinaryTree, binaryTreeTraverse;
    binaryTreeTraverse = function(node, callback) {
      if (node !== null) {
        binaryTreeTraverse(node.left, callback);
        callback(node.value);
        binaryTreeTraverse(node.right, callback);
      }
      return void 0;
    };
    return AbstractBinaryTree = (function() {
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
  });

}).call(this);

/*
//@ sourceMappingURL=AbstractBinaryTreeStrategy.js.map
*/