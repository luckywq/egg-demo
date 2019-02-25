'use strict';

const extend = {
  superType(data) {
    const type = Object.prototype.toString.call(data).toLowerCase();
    return type.replace(/^\[object\s(\w+)\]$/, (...rest) => {
      return rest[1];
    });
  },
  serializeQuary(url, data) {
    url += '?';
    for (const key of Object.keys(data)) {
      if (
        this.superType(data[key]) !== 'number' &&
        this.superType(data[key]) !== 'string' &&
        this.superType(data[key]) !== 'boolean'
      ) {
        data[key] = JSON.stringify(data[key]);
      }
      url += `${key}=${data[key]}&`;
    }
    return url.substring(0, url.length - 1);
  },
  versioning(path) {
    if (path[0] !== '/') {
      throw new Error('API path must start with "/"');
    }
    const version = '/v' + this.config.version.split('.')[0];
    return version + path;
  },
  standardRes(code = 200, message = '', result = {}) {
    if (this.superType(result) === 'array') {
      const total = result.length;
      result = {
        total,
        rows: result,
      };
    }
    return { code, message, result };
  },
  addDefaultTime(origin) {
    const time = Date.now();
    return Object.assign(origin, {
      created_at: time,
      updated_at: time,
    });
  },
  addUpdateTime(origin) {
    const time = Date.now();
    return Object.assign(origin, {
      updated_at: time,
    });
  },
  getRandomIndex(array) {
    return Math.round(Math.random() * (array.length - 1));
  },
  whereFormater(origin, where) {
    if (!where) return origin;
    for (const prop of Object.keys(where)) {
      origin = origin.filter(item => {
        if (this.superType(where[prop]) === 'array') {
          return where[prop].includes(item[prop]);
        }
        return item[prop] === where[prop];
      });
    }
    return origin;
  },
  filterFormater(requestData) {
    if (!requestData.opts || !requestData.opts.where) return requestData;
    const handler = Object.assign({}, requestData);
    handler.filter = handler.opts.where;
    delete handler.opts;
    return handler;
  },
  columnsFormater(origin, columns) {
    if (columns) {
      return origin.map(item => {
        const itemCopy = {};
        for (const prop of columns) {
          if (extend.superType(item[prop]) !== 'undefined') {
            itemCopy[prop] = item[prop];
          }
        }
        return itemCopy;
      });
    }
    return origin;
  },
  pagingFormater(origin, limit, offset) {
    if (!limit && this.superType(offset) !== 'number') return origin;
    return {
      total: origin.length,
      rows: origin.splice(offset, (offset + 1) * limit),
    };
  },
  likeFormater(origin, like, prop) {
    if (!like || !like[prop]) return origin;
    const res = origin.filter(item => item[prop].includes(like[prop]));
    return res;
  },
};

module.exports = extend;
