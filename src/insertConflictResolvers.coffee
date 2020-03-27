
module.exports.throw = (oldValue, newValue) -> throw 'Value already in set'
module.exports.replace = (oldValue, newValue) -> newValue
module.exports.ignore = (oldValue, newValue) -> oldValue
