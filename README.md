Sorted Set
==========

A sorted set is a data structure with these guarantees:

* It's a set: it can only contain any given item once.
* It's sorted: you can iterate over all its items in order.

As an illustration, let's build a simple sorted set out of an `Array`:

| Operation | Syntax (simple JavaScript Array) |
| --------- | -------------------------------- |
| Create | `const set = []` |
| Insert | `set.push(value)` |
| Remove | `set.splice(set.indexOf(value), 1)` |
| Iterate | `set.sort(); set.forEach(doSomething)` |
| Find | `set.sort(); const index = set.indexOf(value)` |
| Previous | `const previousIndex = index - 1` |
| Next | `const nextIndex = index + 1` |
| Test | `const isInSet = set.indexOf(value) != -1` |

... this works, but it's a bit cryptic and some operations--notably iterate--
will be very slow with large sets.

Usage
=====

You can `npm install js-sorted-set`. Alternatively, just download
`sorted-set.js` from this directory.

To use it on a Website built with Webpack or Rollup:

    import SortedSet from 'js-sorted-set'

To use it in Node:

    const SortedSet = require('js-sorted-set')

Or, to pollute your global scope, insert this in your HTML:

    <script src="path/to/sorted-set.js"></script>

Now that you have the `SortedSet` class, here's how to use it:

    const set = new SortedSet({ comparator: function(a, b) { return b - a }})
    set.insert(5)
    set.insert(3)
    set.insert(2)
    set.remove(3)
    const yes = set.contains(2)
    console.log(set.map(function(x) { return x * 2 })) // returns [ 10, 4 ]

Operations
==========

The SortedSet API:

| Operation | Syntax (js-sorted-set) | Notes |
| --------- | ----------------------- | ----- |
| Create | `const set = new SortedSet()` |
| Insert | `set.insert(value)` |
| Remove | `set.remove(value)` |
| Clear | `set.clear()` |
| Length | `set.length` |
| Test | `set.contains(value)` | Returns `true` or `false` |
| Iterate | `set.forEach(doSomething)` | Plus `set.map()` and other [iterative methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6#Array_extras), returning `Array`s and scalars |

Find, Previous and Next work with an Iterator pattern. An iterator is an
immutible pointer into the space "between" two items in the set.

    const iterator = set.beginIterator() // points to the left of the leftmost item
    const iterator2 = iterator.next() // points to the left of the second item
    const value = iterator.value(), value2 = iterator2.value()
    const end = set.endIterator() // points to the right of the final item
    const value2 = end.value() // null, because there is no item

Here's the full SortedSet iterator API:

| Operation | Syntax (js-sorted-set) | Notes |
| --------- | ---------------------- | ----- |
| Length | `const len = set.length` |
| Find | `const iterator = set.findIterator(value)` | `iterator` points to the left of `value`. If `value` is not in `set`, `iterator` points to the left of the first item _greater than_ `value`. If `value` is greater than the final item in `set`, `iterator` points to the right of the final item. |
| Begin | `const iterator = set.beginIterator()` | If `set` is empty, this is equivalent to `const iterator = set.endIterator()` |
| End | `const iterator = set.endIterator()` | Points past the end of `set` there is never a value here |
| Value | `const value = iterator.value()` | For an end iterator, returns `null` |
| Forward | `const iterator2 = iterator.next()` | If `iterator` is an end iterator, returns `null` |
| Backward | `const iterator2 = iterator.previous()` | If `iterator` is a begin iterator, returns `null` |
| Can go forward | `const isBegin = !iterator.hasPrevious()` | |
| Can go backward | `const isEnd = !iterator.hasNext()` | Remember, if `iterator` is pointing to the left of the final item in `set`, then `hasNext()` will return `true` -- even though `iterator.next().value() === null` |

All iterators on `set` become invalid as soon as something calls `set.insert()`
or `set.remove()`.

Options
=======

How exactly will these elements be ordered? Let's add a `comparator` option.
This is the argument we would pass to
[Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort):

    const compareNumbers = (a, b) => a - b
    const set = new SortedSet({ comparator: compareNumbers })

How to handle insert conflicts? We'll also add a `onInsertConflict` option that
provides users with a way to specify what to do in case an item is inserted
that matches another item already present within the set. Such behavior 
**must** be specified as a function taking in the conflicting items and
returning a replacement item for the previously inserted one. The `SortedSet`
class ships with three implementations such behavior:

    SortedSet.OnInsertConflictThrow     // throws an error
    SortedSet.OnInsertConflictReplace   // keeps the new item
    SortedSet.OnInsertConflictIgnore    // keeps the previous item

Unless differently specified through the `onInsertConflict` option, the 
`SortedSet` class will default to `SortedSet.OnInsertConflictThrow`:

    const set = new SortedSet({ 
        onInsertConflict: SortedSet.OnInsertConflictThrow
    })
    set.insert("foo")
    set.insert("foo") // throw an error

Finally, some algorithms ask for really fast replacement mechanisms. So let's
add a `setValue()` method to the iterator, which puts the onus on the user to
keep things ordered.

Because this is a particularly dangerous API to use, you must set the option
`allowSetValue: true` when creating the SortedSet.

    const set = new SortedSet({ allowSetValue: true })
    set.insert("foo")
    set.insert("bar")
    set.insert("baz")

    // Shortcut API
    const iterator = set.findIterator("bar")
    iterator.setValue("baq") // It must stay ordered! Do not set "bbq" here!
    // The shortcut executes very quickly, but if the user makes a mistake,
    // future operations will likely fail

    // iterator.setValue("baq") here is equivalent to:
    // set.remove("bar")
    // set.insert("baq")

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

    const set = new SortedSet({ strategy: SortedSet.ArrayStrategy }) // Array
    const set = new SortedSet({ strategy: SortedSet.BinaryTreeStrategy }) // simple binary tree
    const set = new SortedSet({ strategy: SortedSet.RedBlackTreeStrategy }) // default

Use the `ArrayStrategy` if your set will only have a few values at a time. Use
the `BinaryTreeStrategy` if you've run lots of tests and can prove it's faster
than the others. If neither of these conditions applies, use the default,
`RedBlackTreeStrategy`.

You'll see running times like this:

| Operation | Array | Binary tree | Red-black tree |
| --------- | ----- | ----------- | -------------- |
| Create | O(1) | O(1) | O(1) |
| Length | O(1) | O(1) | O(1) |
| Clear | O(1) | O(n) (in garbage collector) | O(n) (in garbage collector) |
| Insert | O(n) (often slow) | O(n) (often slow) | O(lg n) (fast) |
| Remove | O(n) (often slow) | O(n) (often slow) | O(lg n) (fast) |
| Iterate | O(n) (fast) | O(n) (slowest) | O(n) (slower than Array) |
| Find, Test | O(lg n) (fastest) | O(n) (slowest) | O(lg n) (slower than Array) |

According to some simple [jsPerf
tests](http://jsperf.com/js-sorted-set-insert-remove), you should use
`ArrayStrategy` if you plan on maintaining about 100 to 1,000 items in your set.
At that size, `ArrayStrategy`'s `insert()` and `remove()` are fastest in today's
browsers; and `ArrayStrategy`'s iteration is faster at all sizes.

Contributing
============

1. Fork this repository
2. Run `npm install`
3. Write the behavior you expect in `test/`
4. Edit files in `src/` until `npm test` says you're done
5. Run `npm run build` to update build products
6. Submit a pull request

License
=======

I, Adam Hooper, the sole author of this project, waive all my rights to it and
release it under the [Public
Domain](http://creativecommons.org/publicdomain/zero/1.0/). Do with it what you
will.

My hope is that a JavaScript implementation of red-black trees somehow makes the
world a better place.
