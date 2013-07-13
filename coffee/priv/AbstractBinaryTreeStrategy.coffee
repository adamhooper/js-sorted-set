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

    findIterator: (value) -> BinaryTreeIterator.find(this, value, @comparator)
    beginIterator: -> BinaryTreeIterator.left(this)
    endIterator: -> BinaryTreeIterator.right(this)
