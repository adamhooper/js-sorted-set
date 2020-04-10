
require('../test_helper');
const ArrayStrategy = require('../../lib/SortedSet/ArrayStrategy');
const StrategyHelper = require('../helpers/StrategyHelper');

StrategyHelper.describeStrategy('Array-based strategy', ArrayStrategy);
