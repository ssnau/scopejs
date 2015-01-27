// es5 shims
var util = require('./util');
var filter = util.filter;
var map = util.map;
var exclude = util.exclude;
var keys = util.keys;
var each = util.each;
var merge = util.merge;
var deepEqual = util.deepEqual;
var isPOJO = util.isPOJO;
var isArray = util.isArray;

var namedInstance = {};
function Scope(){
  this._watched = [];
}

Scope.getInstance = function(name) {
  if (!namedInstance[name]) {
    namedInstance[name] = new Scope();
  }
  return namedInstance[name];
}

/**
 * use to restrict the function passed in.
 * only call once under current stack;
 */
function tick(func) {
  var handle = null;
  return function() {
    log('handle is:', handle && handle._idleStart);
    var context = this;
    var args = arguments;
    if (handle) return;
    handle = setTimeout(function(){
      handle = null;
      func.apply(context, args);
    }, 1);
  };
};
function log(){
  console.log.apply(console, arguments);
}

function equal(a, b) {
  // NaN should equal to NaN
  if (a != a && b != b) return true;

  return a === b;
}
Scope.prototype = {
  constructor: Scope,
  _digest: tick(function(_count){
    var invokeList = [];
    var dirty = false;
    var count = _count || 1;
    each(this._watched, function(config) {
      var oldValue = config.value;
      var newValue = config.func();
      if (!equal(oldValue, newValue)) {
        config.value = newValue;
        dirty = true;
        invokeList.push({
          func: config.callback,
          args: [newValue, oldValue]
        });
      }
    });

    each(invokeList, function(config) {
      config.func.apply(null, config.args);
    });

    if (count >= 10) {
      return log('max loop reached, give up');
    }

    if (dirty && count < 10) {
      this._digest(count + 1);
    }

  }),
  $set: function(name, value) {
    var me = this;
    if (name instanceof Object) {
      return each(name, function(val, key) {
        me[key] = val;
      });
    } 

    me[name] = value;
  },
  $apply: function() {
    this._digest();
  },
  $watch: function(expression, callback) {
    var func = expression;
    var me = this;
    if (typeof expression === 'string') {
      func = function() {
        try {
            with(this) {
              return eval('(' + expression + ')');
            }
          } catch(e) {
            return null;
          }
      };
    }
    this._watched.push({
      value: null,
      func: function() {
        return func.apply(me, null);
      },
      callback: callback
    });
    this._digest();
  }
}
module.exports = Scope;
