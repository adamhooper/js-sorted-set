define [ './BinaryTreeIterator' ], (BinaryTreeIterator) ->
  binaryTreeTraverse = (node, callback) ->
    if node isnt null
      binaryTreeTraverse(node.left, callback)
      callback(node.value)
      binaryTreeTraverse(node.right, callback)
    undefined

  # An AbstractBinaryTree has a @root. @root is null or an object with
  # `.left`, `.right` and `.value` properties.
  class AbstractBinaryTree
    toArray: ->
      ret = []
      binaryTreeTraverse(@root, (value) -> ret.push(value))
      ret

    forEachImpl: (callback, sortedSet, thisArg) ->
      i = 0
      binaryTreeTraverse @root, (value) ->
        callback.call(thisArg, value, i, sortedSet)
        i += 1
      undefined

    contains: (value) ->
      comparator = @comparator

      node = @root
      while node isnt null
        cmp = comparator(value, node.value)
        if cmp == 0
          break
        else if cmp < 0
          node = node.left
        else
          node = node.right

      node isnt null && node.value == value

    findIterator: (value) -> BinaryTreeIterator.find(this, value, @comparator)
    beginIterator: -> BinaryTreeIterator.left(this)
    endIterator: -> BinaryTreeIterator.right(this)
