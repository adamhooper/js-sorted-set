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