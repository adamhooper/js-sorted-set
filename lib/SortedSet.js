"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _AbstractSortedSet = _interopRequireDefault(require("./SortedSet/AbstractSortedSet"));

var _ArrayStrategy = _interopRequireDefault(require("./SortedSet/ArrayStrategy"));

var _BinaryTreeStrategy = _interopRequireDefault(require("./SortedSet/BinaryTreeStrategy"));

var _RedBlackTreeStrategy = _interopRequireDefault(require("./SortedSet/RedBlackTreeStrategy"));

var insertConflictResolvers = _interopRequireWildcard(require("./insertConflictResolvers"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SortedSet extends _AbstractSortedSet.default {
  constructor(options) {
    options || (options = {});
    options.strategy || (options.strategy = _RedBlackTreeStrategy.default);
    options.comparator || (options.comparator = function (a, b) {
      return (a || 0) - (b || 0);
    });
    options.onInsertConflict || (options.onInsertConflict = insertConflictResolvers.throw);
    super(options);
  }

}

;
SortedSet.ArrayStrategy = _ArrayStrategy.default;
SortedSet.BinaryTreeStrategy = _BinaryTreeStrategy.default;
SortedSet.RedBlackTreeStrategy = _RedBlackTreeStrategy.default;
SortedSet.OnInsertConflictThrow = insertConflictResolvers.throw;
SortedSet.OnInsertConflictReplace = insertConflictResolvers.replace;
SortedSet.OnInsertConflictIgnore = insertConflictResolvers.ignore;
var _default = SortedSet;
exports.default = _default;
module.exports = exports.default;