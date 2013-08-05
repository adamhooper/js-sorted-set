(function () {
/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

(function() {
  define('SortedSet/AbstractSortedSet',[],function() {
    var AbstractSortedSet;
    return AbstractSortedSet = (function() {
      function AbstractSortedSet(options) {
        if ((options != null ? options.strategy : void 0) == null) {
          throw 'Must pass options.strategy, a strategy';
        }
        if ((options != null ? options.comparator : void 0) == null) {
          throw 'Must pass options.comparator, a comparator';
        }
        this.priv = new options.strategy(options);
      }

      AbstractSortedSet.prototype.insert = function(value) {
        this.priv.insert(value);
        return this;
      };

      AbstractSortedSet.prototype.remove = function(value) {
        this.priv.remove(value);
        return this;
      };

      AbstractSortedSet.prototype.contains = function(value) {
        return this.priv.contains(value);
      };

      AbstractSortedSet.prototype.toArray = function() {
        return this.priv.toArray();
      };

      AbstractSortedSet.prototype.forEach = function(callback, thisArg) {
        this.priv.forEachImpl(callback, this, thisArg);
        return this;
      };

      AbstractSortedSet.prototype.map = function(callback, thisArg) {
        var ret;
        ret = [];
        this.forEach(function(value, index, self) {
          return ret.push(callback.call(thisArg, value, index, self));
        });
        return ret;
      };

      AbstractSortedSet.prototype.filter = function(callback, thisArg) {
        var ret;
        ret = [];
        this.forEach(function(value, index, self) {
          if (callback.call(thisArg, value, index, self)) {
            return ret.push(value);
          }
        });
        return ret;
      };

      AbstractSortedSet.prototype.every = function(callback, thisArg) {
        var ret;
        ret = true;
        this.forEach(function(value, index, self) {
          if (ret && !callback.call(thisArg, value, index, self)) {
            return ret = false;
          }
        });
        return ret;
      };

      AbstractSortedSet.prototype.some = function(callback, thisArg) {
        var ret;
        ret = false;
        this.forEach(function(value, index, self) {
          if (!ret && callback.call(thisArg, value, index, self)) {
            return ret = true;
          }
        });
        return ret;
      };

      AbstractSortedSet.prototype.findIterator = function(value) {
        return this.priv.findIterator(value);
      };

      AbstractSortedSet.prototype.beginIterator = function() {
        return this.priv.beginIterator();
      };

      AbstractSortedSet.prototype.endIterator = function() {
        return this.priv.endIterator();
      };

      return AbstractSortedSet;

    })();
  });

}).call(this);

/*
//@ sourceMappingURL=AbstractSortedSet.js.map
*/;
(function() {
  define('SortedSet/ArrayStrategy',[],function() {
    var ArrayStrategy, Iterator, binarySearchForIndex;
    Iterator = function(priv, index) {
      var data;
      data = priv.data;
      return {
        hasNext: function() {
          return index < data.length;
        },
        hasPrevious: function() {
          return index > 0;
        },
        value: function() {
          if (index < data.length) {
            return data[index];
          } else {
            return null;
          }
        },
        setValue: function(value) {
          if (!priv.options.allowSetValue) {
            throw 'Must set options.allowSetValue';
          }
          if (!this.hasNext()) {
            throw 'Cannot set value at end of set';
          }
          return data[index] = value;
        },
        next: function() {
          if (index >= data.length) {
            return null;
          } else {
            return new Iterator(priv, index + 1);
          }
        },
        previous: function() {
          if (index <= 0) {
            return null;
          } else {
            return new Iterator(priv, index - 1);
          }
        }
      };
    };
    binarySearchForIndex = function(array, value, comparator) {
      var high, low, mid;
      low = 0;
      high = array.length;
      while (low < high) {
        mid = (low + high) >>> 1;
        if (comparator(array[mid], value) < 0) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return low;
    };
    return ArrayStrategy = (function() {
      function ArrayStrategy(options) {
        this.options = options;
        this.comparator = this.options.comparator;
        this.data = [];
      }

      ArrayStrategy.prototype.toArray = function() {
        return this.data;
      };

      ArrayStrategy.prototype.insert = function(value) {
        var index;
        index = binarySearchForIndex(this.data, value, this.comparator);
        if (this.data[index] === value) {
          throw 'Value already in set';
        }
        return this.data.splice(index, 0, value);
      };

      ArrayStrategy.prototype.remove = function(value) {
        var index;
        index = binarySearchForIndex(this.data, value, this.comparator);
        if (this.data[index] !== value) {
          throw 'Value not in set';
        }
        return this.data.splice(index, 1);
      };

      ArrayStrategy.prototype.contains = function(value) {
        return this.data.indexOf(value) !== -1;
      };

      ArrayStrategy.prototype.forEachImpl = function(callback, sortedSet, thisArg) {
        var index, value, _i, _len, _ref;
        _ref = this.data;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          value = _ref[index];
          callback.call(thisArg, value, index, sortedSet);
        }
        return void 0;
      };

      ArrayStrategy.prototype.findIterator = function(value) {
        var index;
        index = binarySearchForIndex(this.data, value, this.comparator);
        return new Iterator(this, index);
      };

      ArrayStrategy.prototype.beginIterator = function() {
        return new Iterator(this, 0);
      };

      ArrayStrategy.prototype.endIterator = function() {
        return new Iterator(this, this.data.length);
      };

      return ArrayStrategy;

    })();
  });

}).call(this);

/*
//@ sourceMappingURL=ArrayStrategy.js.map
*/;
(function() {
  define('SortedSet/BinaryTreeIterator',[], function() {
    var BinaryTreeIterator, descendAllTheWay, moveCursor;
    descendAllTheWay = function(leftOrRight, node) {
      var parent;
      while (node[leftOrRight] !== null) {
        parent = node;
        node = node[leftOrRight];
        node._iteratorParentNode = parent;
      }
      return node;
    };
    moveCursor = function(leftOrRight, node) {
      var parent, rightOrLeft;
      if (node[leftOrRight] !== null) {
        parent = node;
        node = node[leftOrRight];
        node._iteratorParentNode = parent;
        rightOrLeft = leftOrRight === 'left' ? 'right' : 'left';
        node = descendAllTheWay(rightOrLeft, node);
      } else {
        while ((parent = node._iteratorParentNode) !== null && parent[leftOrRight] === node) {
          node = parent;
        }
        node = parent;
      }
      return node;
    };
    BinaryTreeIterator = (function() {
      function BinaryTreeIterator(tree, node) {
        this.tree = tree;
        this.node = node;
      }

      BinaryTreeIterator.prototype.next = function() {
        var node;
        if (this.node === null) {
          return null;
        } else {
          node = moveCursor('right', this.node);
          return new BinaryTreeIterator(this.tree, node);
        }
      };

      BinaryTreeIterator.prototype.previous = function() {
        var node;
        if (this.node === null) {
          if (this.tree.root === null) {
            return null;
          } else {
            this.tree.root._iteratorParentNode = null;
            node = descendAllTheWay('right', this.tree.root);
            return new BinaryTreeIterator(this.tree, node);
          }
        } else {
          node = moveCursor('left', this.node);
          if (node === null) {
            return null;
          } else {
            return new BinaryTreeIterator(this.tree, node);
          }
        }
      };

      BinaryTreeIterator.prototype.hasNext = function() {
        return this.node !== null;
      };

      BinaryTreeIterator.prototype.hasPrevious = function() {
        return this.previous() !== null;
      };

      BinaryTreeIterator.prototype.value = function() {
        if (this.node === null) {
          return null;
        } else {
          return this.node.value;
        }
      };

      BinaryTreeIterator.prototype.setValue = function(value) {
        if (!this.tree.options.allowSetValue) {
          throw 'Must set options.allowSetValue';
        }
        if (!this.hasNext()) {
          throw 'Cannot set value at end of set';
        }
        return this.node.value = value;
      };

      return BinaryTreeIterator;

    })();
    BinaryTreeIterator.find = function(tree, value, comparator) {
      var cmp, nextNode, node, root;
      root = tree.root;
      if (root != null) {
        root._iteratorParentNode = null;
      }
      node = root;
      nextNode = null;
      while (node !== null) {
        cmp = comparator(value, node.value);
        if (cmp === 0) {
          break;
        } else if (cmp < 0) {
          if (node.left === null) {
            break;
          }
          nextNode = node;
          node.left._iteratorParentNode = node;
          node = node.left;
        } else {
          if (node.right !== null) {
            node.right._iteratorParentNode = node;
            node = node.right;
          } else {
            node = nextNode;
            break;
          }
        }
      }
      return new BinaryTreeIterator(tree, node);
    };
    BinaryTreeIterator.left = function(tree) {
      var node;
      if (tree.root === null) {
        return new BinaryTreeIterator(tree, null);
      } else {
        tree.root._iteratorParentNode = null;
        node = descendAllTheWay('left', tree.root);
        return new BinaryTreeIterator(tree, node);
      }
    };
    BinaryTreeIterator.right = function(tree) {
      return new BinaryTreeIterator(tree, null);
    };
    return BinaryTreeIterator;
  });

}).call(this);

/*
//@ sourceMappingURL=BinaryTreeIterator.js.map
*/;
(function() {
  define('SortedSet/AbstractBinaryTreeStrategy',['./BinaryTreeIterator'], function(BinaryTreeIterator) {
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
*/;
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('SortedSet/BinaryTreeStrategy',['./AbstractBinaryTreeStrategy'], function(AbstractBinaryTreeStrategy) {
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
*/;
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('SortedSet/RedBlackTreeStrategy',['./AbstractBinaryTreeStrategy'], function(AbstractBinaryTreeStrategy) {
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
*/;
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('SortedSet',['./SortedSet/AbstractSortedSet', './SortedSet/ArrayStrategy', './SortedSet/BinaryTreeStrategy', './SortedSet/RedBlackTreeStrategy'], function(AbstractSortedSet, ArrayStrategy, BinaryTreeStrategy, RedBlackTreeStrategy) {
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
*/;
(function() {
  require(['./SortedSet'], function(SortedSet) {
    return window.SortedSet = SortedSet;
  });

}).call(this);

/*
//@ sourceMappingURL=index.js.map
*/;
define("index", function(){});
}());