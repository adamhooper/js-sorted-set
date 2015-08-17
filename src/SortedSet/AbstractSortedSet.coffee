module.exports = class AbstractSortedSet
  constructor: (options) ->
    throw 'Must pass options.strategy, a strategy' if !options?.strategy?
    throw 'Must pass options.comparator, a comparator' if !options?.comparator?
    @priv = new options.strategy(options)
    @length = 0

  insert: (value) ->
    @priv.insert(value)
    @length += 1
    this

  remove: (value) ->
    @priv.remove(value)
    @length -= 1
    this

  clear: ->
    @priv.clear()
    @length = 0
    this

  contains: (value) ->
    @priv.contains(value)

  # Returns this set as an Array
  toArray: -> @priv.toArray()

  forEach: (callback, thisArg) ->
    @priv.forEachImpl(callback, this, thisArg)
    this

  map: (callback, thisArg) ->
    ret = []
    @forEach (value, index, self) ->
      ret.push(callback.call(thisArg, value, index, self))
    ret

  filter: (callback, thisArg) ->
    ret = []
    @forEach (value, index, self) ->
      ret.push(value) if callback.call(thisArg, value, index, self)
    ret

  every: (callback, thisArg) ->
    ret = true
    @forEach (value, index, self) ->
      ret = false if ret && !callback.call(thisArg, value, index, self)
    ret

  some: (callback, thisArg) ->
    ret = false
    @forEach (value, index, self) ->
      ret = true if !ret && callback.call(thisArg, value, index, self)
    ret

  # An iterator is similar to a C++ iterator: it points _before_ a value.
  #
  # So in this sorted set:
  #
  #   | 1 | 2 | 3 | 4 | 5 |
  #   ^a      ^b          ^c
  #
  # `a` is a pointer to the beginning of the iterator. `a.value()` returns
  # `3`. `a.previous()` returns `null`. `a.setValue()` works, if
  # `options.allowSetValue` is true.
  # 
  # `b` is a pointer to the value `3`. `a.previous()` and `a.next()` both do
  # the obvious.
  #
  # `c` is a pointer to the `null` value. `c.previous()` works; `c.next()`
  # returns null. `c.setValue()` throws an exception, even if
  # `options.allowSetValue` is true.
  #
  # Iterators have `hasNext()` and `hasPrevious()` methods, too.
  #
  # Iterators are immutible. `iterator.next()` returns a new iterator.
  #
  # Iterators become invalid as soon as `insert()` or `remove()` is called.
  findIterator: (value) ->
    @priv.findIterator(value)

  # Finds an iterator pointing to the lowest possible value.
  beginIterator: ->
    @priv.beginIterator()

  # Finds an iterator pointing to the `null` value.
  endIterator: ->
    @priv.endIterator()
