AbstractBinaryTreeStrategy = require('./AbstractBinaryTreeStrategy')

class Node
  constructor: (@value) ->
    @left = null
    @right = null

nodeAllTheWay = (node, leftOrRight) ->
  while node[leftOrRight] isnt null
    node = node[leftOrRight]
  node

# Returns the subtree, minus value
binaryTreeDelete = (node, value, comparator) ->
  throw 'Value not in set' if node is null

  cmp = comparator(value, node.value)
  if cmp < 0
    node.left = binaryTreeDelete(node.left, value, comparator)
  else if cmp > 0
    node.right = binaryTreeDelete(node.right, value, comparator)
  else # This is the value we want to remove
    if node.left is null && node.right is null
      node = null
    else if node.right is null
      node = node.left
    else if node.left is null
      node = node.right
    else
      nextNode = nodeAllTheWay(node.right, 'left')
      node.value = nextNode.value
      node.right = binaryTreeDelete(node.right, nextNode.value, comparator)

  node

class BinaryTreeStrategy extends AbstractBinaryTreeStrategy
  constructor: (@options) ->
    super()
    @comparator = @options.comparator
    @root = null

  insert: (value) ->
    compare = @comparator
    if @root?
      parent = @root
      loop
        cmp = compare(value, parent.value)
        throw 'Value already in set' if cmp == 0
        leftOrRight = if cmp < 0 then 'left' else 'right'
        break if parent[leftOrRight] == null
        parent = parent[leftOrRight]
      parent[leftOrRight] = new Node(value)
    else
      @root = new Node(value)

  remove: (value) ->
    @root = binaryTreeDelete(@root, value, @comparator)

module.exports = BinaryTreeStrategy
