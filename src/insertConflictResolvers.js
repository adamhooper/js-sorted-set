
const throw_ = (oldValue, newValue) => {
  throw 'Value already in set';
};

export { throw_ as throw };

export const replace = (oldValue, newValue) => {
  return newValue;
};

export const ignore = (oldValue, newValue) => {
  return oldValue;
};

