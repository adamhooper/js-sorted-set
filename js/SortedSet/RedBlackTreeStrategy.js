(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['./AbstractBinaryTreeStrategy'], function(AbstractBinaryTreeStrategy) {
    var Node, RedBlackTreeStrategy, colorFlip, findMinNode, fixUp, insertInNode, moveRedLeft, moveRedRight, removeFromNode, removeMinNode, rotateLeft, rotateRight;
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
    return RedBlackTreeStrategy = (function(_super) {
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
  });

}).call(this);

/*
//@ sourceMappingURL=RedBlackTreeStrategy.js.map
*/