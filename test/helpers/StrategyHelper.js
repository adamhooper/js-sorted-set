const SortedSet = require('../../lib/SortedSet')

const numberComparator = (a, b) => {
  return a - b
}

const describeStrategy = (description, strategy) => {
  describe(description, function () {
    let priv

    describe('starting empty', function () {
      beforeEach(function () {
        priv = new strategy({
          comparator: numberComparator
        })
      })

      it('should not contain a value', function () {
        expect(priv.contains(2)).to.eq(false)
      })

      it('should store its data in an array for easy testing', function () {
        expect(priv.toArray()).to.deep.eq([])
      })

      it('should insert an element', function () {
        priv.insert(4)
        expect(priv.toArray()).to.deep.eq([4])
      })

      it('should fail to remove an element', function () {
        expect(function () {
          priv.remove(4)
        }).to.throw('Value not in set')
      })

      it('should return an iterator with no next or previous', function () {
        const iterator = priv.findIterator(4)
        expect(iterator.hasNext()).to.eq(false)
        expect(iterator.hasPrevious()).to.eq(false)
        expect(iterator.next()).to.eq(null)
        expect(iterator.previous()).to.eq(null)
        expect(iterator.value()).to.eq(null)
      })

      it('should return a beginIterator', function () {
        const iterator = priv.beginIterator()
        expect(iterator.value()).to.eq(null)
      })

      it('should return an endIterator', function () {
        const iterator = priv.endIterator()
        expect(iterator.value()).to.eq(null)
      })

      it('should do nothing in forEachImpl()', function () {
        const callback = sinon.spy()
        priv.forEachImpl(callback)
        expect(callback).not.to.have.been.called
      })
    })
    describe('with some numbers', function () {
      beforeEach(function () {
        priv = new strategy({
          comparator: numberComparator
        })
        // Insert in this order so binary tree isn't one-sided
        priv.insert(2)
        priv.insert(1)
        priv.insert(3)
      })

      it('should insert at the beginning', function () {
        priv.insert(0)
        expect(priv.toArray()).to.deep.eq([0, 1, 2, 3])
      })

      it('should insert in the middle', function () {
        priv.insert(2.5)
        expect(priv.toArray()).to.deep.eq([1, 2, 2.5, 3])
      })

      it('should insert at the end', function () {
        priv.insert(4)
        expect(priv.toArray()).to.deep.eq([1, 2, 3, 4])
      })

      it('should remove from the beginning', function () {
        priv.remove(1)
        expect(priv.toArray()).to.deep.eq([2, 3])
      })

      it('should remove from the end', function () {
        priv.remove(3)
        expect(priv.toArray()).to.deep.eq([1, 2])
      })

      it('should remove from the middle', function () {
        priv.remove(2)
        expect(priv.toArray()).to.deep.eq([1, 3])
      })

      it('should clear', function () {
        priv.clear()
        expect(priv.toArray()).to.deep.eq([])
      })

      it('should allow insert after clear', function () {
        priv.clear()
        priv.insert(4)
        priv.insert(2)
        expect(priv.toArray()).to.deep.eq([2, 4])
      })

      it('should contain the first value', function () {
        expect(priv.contains(1)).to.eq(true)
      })

      it('should contain the last value', function () {
        expect(priv.contains(3)).to.eq(true)
      })

      it('should contain a middle value', function () {
        expect(priv.contains(2)).to.eq(true)
      })

      it('should not contain a value below the lowest', function () {
        expect(priv.contains(0)).to.eq(false)
      })

      it('should not contain a value above the highest', function () {
        expect(priv.contains(4)).to.eq(false)
      })

      it('should not contain a value in between two values', function () {
        expect(priv.contains(1.5)).to.eq(false)
      })

      it('should return false from contain', function () {
        expect(priv.contains(4)).to.eq(false)
      })

      it('should return a begin iterator', function () {
        const iterator = priv.beginIterator()
        expect(iterator.previous()).to.eq(null)
        expect(iterator.value()).to.eq(1)
      })

      it('should return an end iterator', function () {
        const iterator = priv.endIterator()
        expect(iterator.next()).to.eq(null)
        expect(iterator.value()).to.eq(null)
      })

      it('should find an iterator', function () {
        const iterator = priv.findIterator(2)
        expect(iterator.value()).to.eq(2)
      })

      it('should find an iterator between values', function () {
        const iterator = priv.findIterator(1.5)
        expect(iterator.value()).to.eq(2)
      })

      it('should find an iterator with a value above the max', function () {
        const iterator = priv.findIterator(3.5)
        expect(iterator.value()).to.eq(null)
      })

      it('should find an iterator with a value below the min', function () {
        const iterator = priv.findIterator(0.5)
        expect(iterator.value()).to.eq(1)
      })

      it('should find a previous iterator', function () {
        const iterator = priv.findIterator(2).previous()
        expect(iterator.value()).to.eq(1)
      })

      it('should find a next iterator', function () {
        const iterator = priv.findIterator(2).next()
        expect(iterator.value()).to.eq(3)
      })

      it('should step to previous from the end iterator', function () {
        const iterator = priv.endIterator().previous()
        expect(iterator.value()).to.eq(3)
      })

      it('should step to end from a previous iterator', function () {
        const iterator = priv.findIterator(3).next()
        expect(iterator.value()).to.eq(null)
      })

      it('should fail to setValue()', function () {
        const iterator = priv.findIterator(2)
        expect(function () {
          iterator.setValue(2.5)
        }).to.throw()
      })

      it('should iterate in forEachImpl', function () {
        const set = 'foo'
        const thisArg = 'moo'
        const spy = sinon.spy()
        priv.forEachImpl(spy, set, thisArg)
        expect(spy).to.have.callCount(3)
        expect(spy.thisValues[0]).to.eq(thisArg)
        expect(spy.args[0]).to.deep.eq([1, 0, set])
        expect(spy.args[1]).to.deep.eq([2, 1, set])
        expect(spy.args[2]).to.deep.eq([3, 2, set])
      })
    })

    describe('with allowSetValue', function () {
      beforeEach(function () {
        priv = new strategy({
          comparator: numberComparator,
          allowSetValue: true
        })
        priv.insert(1)
        priv.insert(2)
      })

      it('should allow you to use setValue(), even to do something stupid', function () {
        const iterator = priv.findIterator(2)
        iterator.setValue(0)
        expect(priv.toArray()).to.deep.eq([1, 0])
      })

      it('should not allow setValue() on an end iterator', function () {
        const iterator = priv.endIterator()
        expect(function () {
          iterator.setValue(2.5)
        }).to.throw()
      })
    })

    describe('with throw behavior on insert conflict', function () {
      beforeEach(function () {
        const comparator = function (a, b) {
          return a.v - b.v
        }
        const onInsertConflict = SortedSet.OnInsertConflictThrow
        priv = new strategy({ comparator, onInsertConflict })
        priv.insert({
          v: 1,
          q: 'a'
        })
        priv.insert({
          v: 2,
          q: 'b'
        })
      })

      it('should throw when inserting an element that matches another', function () {
        expect(() => priv.insert({ v: 1, q: 'c' })).to.throw('Value already in set')
      })
    })

    describe('with replace behavior on insert conflict', function () {
      beforeEach(function () {
        let comparator, onInsertConflict
        comparator = function (a, b) {
          return a.v - b.v
        }
        onInsertConflict = SortedSet.OnInsertConflictReplace
        priv = new strategy({ comparator, onInsertConflict })
        priv.insert({
          v: 1,
          q: 'a'
        })
        priv.insert({
          v: 2,
          q: 'b'
        })
      })

      it('should replace a matching element with the new element', function () {
        priv.insert({
          v: 1,
          q: 'c'
        })
        expect(priv.toArray()).to.deep.eq([
          {
            v: 1,
            q: 'c'
          },
          {
            v: 2,
            q: 'b'
          }
        ])
      })
    })

    describe('with ignore behavior on insert conflict', function () {
      beforeEach(function () {
        const comparator = function (a, b) {
          return a.v - b.v
        }
        const onInsertConflict = SortedSet.OnInsertConflictIgnore
        priv = new strategy({ comparator, onInsertConflict })
        priv.insert({
          v: 1,
          q: 'a'
        })
        priv.insert({
          v: 2,
          q: 'b'
        })
      })

      it('should ignore the new element when inserting an element that matches another ', function () {
        priv.insert({
          v: 1,
          q: 'c'
        })
        expect(priv.toArray()).to.deep.eq([
          {
            v: 1,
            q: 'a'
          },
          {
            v: 2,
            q: 'b'
          }
        ])
      })
    })
  })
}

module.exports.describeStrategy = describeStrategy
