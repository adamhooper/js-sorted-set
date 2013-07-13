(function() {
  require(['priv/ArrayStrategy'], function(ArrayStrategy) {
    return StrategyHelper.describeStrategy('Array-based strategy', ArrayStrategy);
  });

}).call(this);
