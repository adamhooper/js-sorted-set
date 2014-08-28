descendAllTheWay = (leftOrRight, node) ->
  # Assumes node._iteratorParentNode is set
  while node[leftOrRight] isnt null
    parent = node
    node = node[leftOrRight]
    node._iteratorParentNode = parent
  node

moveCursor = (leftOrRight, node) ->
  if node[leftOrRight] isnt null
    parent = node
    node = node[leftOrRight]
    node._iteratorParentNode = parent
    rightOrLeft = if leftOrRight == 'left' then 'right' else 'left'
    node = descendAllTheWay(rightOrLeft, node)
  else
    while (parent = node._iteratorParentNode) isnt null && parent[leftOrRight] is node
      node = parent
    node = parent # either null or the correct-direction parent

  node

# The BinaryTreeIterator actually writes to the tree: it maintains a
# "_iteratorParentNode" variable on each node. Please ignore this.
class BinaryTreeIterator
  constructor: (@tree, @node) ->

  next: ->
    if @node is null
      null
    else
      node = moveCursor('right', @node)
      new BinaryTreeIterator(@tree, node)

  previous: ->
    if @node is null
      if @tree.root is null
        null
      else
        @tree.root._iteratorParentNode = null
        node = descendAllTheWay('right', @tree.root)
        new BinaryTreeIterator(@tree, node)
    else
      node = moveCursor('left', @node)
      if node is null
        null
      else
        new BinaryTreeIterator(@tree, node)

  hasNext: -> @node isnt null
  hasPrevious: -> @previous() isnt null
  value: -> if @node is null then null else @node.value
  setValue: (value) ->
    throw 'Must set options.allowSetValue' if !@tree.options.allowSetValue
    throw 'Cannot set value at end of set' if !@hasNext()
    @node.value = value

BinaryTreeIterator.find = (tree, value, comparator) ->
  root = tree.root
  root?._iteratorParentNode = null
  node = root
  nextNode = null # For finding an in-between node
  while node isnt null
    cmp = comparator(value, node.value)
    if cmp == 0
      break
    else if cmp < 0
      break if node.left is null

      nextNode = node # If we descend all right after this until there are
                      # no more right nodes, we want to return an
                      # "in-between" iterator ... pointing here.
      node.left._iteratorParentNode = node
      node = node.left
    else
      if node.right isnt null
        node.right._iteratorParentNode = node
        node = node.right
      else
        node = nextNode
        break

  return new BinaryTreeIterator(tree, node)

BinaryTreeIterator.left = (tree) ->
  if tree.root is null
    new BinaryTreeIterator(tree, null)
  else
    tree.root._iteratorParentNode = null
    node = descendAllTheWay('left', tree.root)
    new BinaryTreeIterator(tree, node)

BinaryTreeIterator.right = (tree) ->
  new BinaryTreeIterator(tree, null)

module.exports = BinaryTreeIterator
