function createlib (Map, q) {
  'use strict';

  var DE = new Error('Defer map destroying');

  function DeferMap (){
    this._map = new Map();
  }

  function rejecter (d) {
    d.reject(DE);
  }
  DeferMap.prototype.destroy = function () {
    this._map.traverse(rejecter);
    this._map.destroy();
    this._map = null;
  };

  DeferMap.prototype.defer = function (name) {
    var d = this._map.get(name), c;

    if (d) {return d;}

    d = q.defer();
    c = this._clean.bind(this, name);
    d.promise.done(c, c);
    this._map.add(name, d);
    return d;
  };

  DeferMap.prototype.promise = function (name) {
    return this.defer(name).promise;
  };

  DeferMap.prototype._clean = function (name) {
    if (!this._map) return;
    this._map.remove(name);
  };

  DeferMap.prototype.resolve = function (name, result) {
    var d = this._map.get(name);
    if (d) {
      d.resolve(result);
    }
  };

  DeferMap.prototype.reject = function (name, reason) {
    var d = this._map.get(name) 
    if (d){
      d.reject(reason);
    }
  };

  DeferMap.prototype.notify = function (name, progress) {
    var d = this._map.get(name);
    if (d) {
      d.notify(progress);
    }
  };

  DeferMap.prototype.exists = function (name) {
    return !!this._map.get(name);
  };

  return DeferMap;
}

module.exports = createlib;
