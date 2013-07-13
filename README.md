Sorted Set
==========

A sorted set is a data structure with these guarantees:

* It's a set: it can only contain any given item once.
* It's sorted: you can iterate over all its items in order.

As an illustration, let's build a simple sorted set out of an `Array`:

| Operation | Syntax (simple JavaScript Array) |
| --------- | -------------------------------- |
| Create | `var set = [];` |
| Insert | `set.push(value);` |
| Remove | `set.splice(set.indexOf(value), 1);` |
| Iterate | `set.sort(); set.forEach(doSomething);` |
| Find | `set.sort(); var index = set.indexOf(value);` |
| Previous | `var previousIndex = index - 1;` |
| Next | `var nextIndex = index + 1;` |

... this works, but it's a bit cryptic and some operations--notably iterate--
will be very slow with large sets.

Installing
==========

Download `sorted-set.js`. Alternatively, install through Bower:
`bower install js-sorted-set`

Include it through [RequireJS](http://requirejs.org/).

Then write code like this:

    require([ 'vendor/sorted-set' ], function(SortedSet) {
      var set = new SortedSet({ comparator: function(a, b) { return b - a; });
      set.insert(5);
      set.insert(3);
      set.insert(2);
      set.remove(3);
      console.log(set.map(function(x) { return x * 2; })); // returns [ 20, 4 ]
    });

If you don't like RequireJS, you can download the standalone version,
`sorted-set.no-require.js`, and write:

    var set = new SortedSet({ comparator: function(a, b) { return b - a; });
    set.insert(5);
    set.insert(3);
    set.insert(2);
    set.remove(3);
    console.log(set.map(function(x) { return x * 2; })); // returns [ 20, 4 ]

Operations
==========

The SortedSet API:

| Operation | Syntax (js-sorted-set) | Notes |
| --------- | ----------------------- | ----- |
| Create | `var set = new SortedSet();` |
| Insert | `set.insert(value);` |
| Remove | `set.remove(value);` |
| Iterate | `set.forEach(doSomething);` | Plus `set.map()` and other [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6#Array_extras), returning `Array`s and scalars |

Find, Previous and Next work with an Iterator pattern. An iterator is an
immutible pointer into the space "between" two items in the set.

    var iterator = set.beginIterator(); // points to the left of the leftmost item
    var iterator2 = iterator.next(); // points to the left of the second item
    var value = iterator.value(), value2 = iterator2.value();
    var end = set.endIterator(); // points to the right of the final item
    var value2 = end.value(); // null, because there is no item

Here's the full SortedSet iterator API:

| Operation | Syntax (js-sorted-set) | Notes |
| --------- | ---------------------- | ----- |
| Find | `var iterator = set.findIterator(value);` | `iterator` points to the left of `value`. If `value` is not in `set`, `iterator` points to the left of the first item _greater than_ `value`. If `value` is greater than the final item in `set`, `iterator` points to the right of the final item. |
| Begin | `var iterator = set.beginIterator();` | If `set` is empty, this is equivalent to `var iterator = set.endIterator();` |
| End | `var iterator = set.endIterator();` | Points past the end of `set`; there is never a value here |
| Value | `var value = iterator.value();` | For an end iterator, returns `null` |
| Forward | `var iterator2 = iterator.next();` | If `iterator` is an end iterator, returns `null` |
| Backward | `var iterator2 = iterator.previous();` | If `iterator` is a begin iterator, returns `null` |
| Can go forward | `var isBegin = !iterator.hasPrevious();` | |
| Can go backward | `var isEnd = !iterator.hasNext();` | Remember, if `iterator` is pointing to the left of the final item in `set`, then `hasNext()` will return `true` -- even though `iterator.next().value() === null` |

All iterators on `set` become invalid as soon as something calls `set.insert()`
or `set.remove()`.

Options
=======

How exactly will these elements be ordered? Let's add a `comparator` option.
This is the argument we would pass to
[Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort):

    var compareNumbers = function(a, b) { return a - b; };
    var set = new SortedSet({ comparator: compareNumbers });

Finally, some algorithms ask for really fast replacement mechanisms. So let's
add a `setValue()` method to the iterator, which puts the onus on the user to
keep things ordered.

Because this is a particularly dangerous API to use, you must set the option
`allowSetValue: true` when creating the SortedSet.

    var set = new SortedSet({ allowSetValue: true });
    set.insert("foo");
    set.insert("bar");
    set.insert("baz");

    // Shortcut API
    var iterator = set.findIterator("bar");
    iterator.setValue("baq"); // It must stay ordered! Do not set "bbq" here!
    // The shortcut executes very quickly, but if the user makes a mistake,
    // future operations will likely fail

    // iterator.setValue("baq"); here is equivalent to:
    // set.remove("bar");
    // set.insert("baq");

Strategies
==========

We can be somewhat efficient in an `Array` approach by avoiding `sort()` calls.
This strategy keeps the array ordered at all times by inserting and removing
elements into and out from the correct array indices. The downside: large swaths
of the array must be rewritten during each insert and remove.

We can also create a simple binary tree. `insert()` and `remove()` won't
overwrite the entire array each time, so this can be faster. But it's far
slower to seek through a binary tree, because it can spread out very far
across memory so the processor won't cache it well. Also, depending on the
order in which elements were input, inserting a single item into the tree can
actually be slower than rewriting an entire `Array`.

Finally, we can improve upon the binary tree by balancing it. This guarantees
a certain maximum number of reads and writes per operation. Think of it this
way: if you're lucky, a simple binary tree's operations can be extremely fast;
if you're unlucky, they can be extremely slow; you'll usually be unlucky. A
balanced tree makes all operations _somewhat_ fast.

The balanced tree (which, incidentally, is a [Left-Leaning Red-Black
tree](http://en.wikipedia.org/wiki/Left-leaning_red%E2%80%93black_tree)) is the
default, because its speed is the most predictable.

Create the sets like this:

    var set = new SortedSet({ strategy: SortedSet.ArrayStrategy }); // Array
    var set = new SortedSet({ strategy: SortedSet.BinaryTreeStrategy }); // simple binary tree
    var set = new SortedSet({ strategy: SortedSet.RedBlackTreeStrategy }); // default

Use the `ArrayStrategy` if your set will only have a few values at a time. Use
the `BinaryTreeStrategy` if you've run lots of tests and can prove it's faster
than the others. If neither of these conditions applies, use the default,
`RedBlackTreeStrategy`.

You'll see running times like this:

| Operation | Array | Binary tree | Red-black tree |
| --------- | ----- | ----------- | -------------- |
| Create | O(1) | O(1) | O(1) |
| Insert | O(n) (often slow) | O(n) (often slow) | O(lg n) (fast) |
| Remove | O(n) (often slow) | O(n) (often slow) | O(lg n) (fast) |
| Iterate | O(n) (fast) | O(n) (slowest) | O(n) (slower than Array) |
| Find | O(lg n) (fastest) | O(n) (slowest) | O(lg n) (slower than Array) |

According to some simple [jsPerf
tests](http://jsperf.com/js-sorted-set-insert-remove), you should use
`ArrayStrategy` if you plan on maintaining about 100 to 1,000 items in your set.
At that size, `ArrayStrategy`'s `insert()` and `remove()` are fastest in today's
browsers; and `ArrayStrategy`'s iteration is faster at all sizes.

Contributing
============

1. Fork this repository
2. Run `npm install`
3. Write the behavior you expect in `spec-coffee/`
4. Edit files in `coffee/` until `grunt test` says you're done
5. Run `grunt` to update `sorted-set.js` and `sorted-set.min.js`
6. Submit a pull request

License
=======

I, Adam Hooper, the sole author of this project, waive all my rights to it and
release it under the [Public
Domain](http://creativecommons.org/publicdomain/zero/1.0/). Do with it what you
will.

My hope is that a JavaScript implementation of red-black trees somehow makes the
world a better place.
