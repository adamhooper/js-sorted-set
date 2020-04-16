const InsertConflictResolvers = {
  OnInsertConflictThrow: (oldValue, newValue) => { throw new Error("Value already in set") },
  OnInsertConflictReplace: (oldValue, newValue) => newValue,
  OnInsertConflictIgnore: (oldValue, newValue) => oldValue,
};
export default InsertConflictResolvers;
