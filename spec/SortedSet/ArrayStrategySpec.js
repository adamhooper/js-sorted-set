(function() {
  require(['SortedSet/ArrayStrategy'], function(ArrayStrategy) {
    return StrategyHelper.describeStrategy('Array-based strategy', ArrayStrategy);
  });

}).call(this);
