"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ignore = exports.replace = exports.throw = void 0;

const throw_ = (oldValue, newValue) => {
  throw 'Value already in set';
};

exports.throw = throw_;

const replace = (oldValue, newValue) => {
  return newValue;
};

exports.replace = replace;

const ignore = (oldValue, newValue) => {
  return oldValue;
};

exports.ignore = ignore;