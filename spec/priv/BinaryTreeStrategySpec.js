(function() {
  require(['priv/BinaryTreeStrategy'], function(BinaryTreeStrategy) {
    return StrategyHelper.describeStrategy('Binary tree-based strategy', BinaryTreeStrategy);
  });

}).call(this);
