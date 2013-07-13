(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['./AbstractBinaryTreeStrategy'], function(AbstractBinaryTreeStrategy) {
    var BinaryTreeStrategy, Node, binaryTreeDelete, nodeAllTheWay;
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
    return BinaryTreeStrategy = (function(_super) {
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
  });

}).call(this);

/*
//@ sourceMappingURL=BinaryTreeStrategy.js.map
*/