(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['./priv/AbstractSortedSet', './priv/ArrayStrategy', './priv/BinaryTreeStrategy', './priv/RedBlackTreeStrategy'], function(AbstractSortedSet, ArrayStrategy, BinaryTreeStrategy, RedBlackTreeStrategy) {
    var SortedSet;
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
    return SortedSet;
  });

}).call(this);

/*
//@ sourceMappingURL=SortedSet.js.map
*/