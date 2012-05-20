// Generated by CoffeeScript 1.3.3
(function() {
  var find, matchArgs,
    __slice = [].slice;

  Inject.cache = function() {
    var results, singleton;
    results = {};
    singleton = function(name, fn) {
      var cachedFactory;
      return cachedFactory = function() {
        var args, array, result;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        array = results[name] || (results[name] = []);
        result = matchArgs(array, args || []);
        if (!result) {
          result = {
            value: fn.apply(this, args),
            args: args
          };
          array.push(result);
        }
        return result.value;
      };
    };
    singleton.def = function(name, fn, eager) {
      return {
        name: name,
        eager: eager,
        factory: this(name, fn)
      };
    };
    singleton.clear = function() {
      var key, keys, _i, _len, _results;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (keys.length) {
        _results = [];
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          key = keys[_i];
          if (key.args) {
            _results.push(matchArgs(results[key.name], key.args, true));
          } else {
            _results.push(delete results[key]);
          }
        }
        return _results;
      } else {
        return results = {};
      }
    };
    return singleton;
  };

  matchArgs = function(results, args, del) {
    var i, miss, result, _i, _len;
    if (!results) {
      return;
    }
    for (i = _i = 0, _len = results.length; _i < _len; i = ++_i) {
      result = results[i];
      miss = find(result.args || [], function(index, arg) {
        return args[index] !== arg;
      });
      if (!miss) {
        if (del) {
          delete result[i];
        }
        return result;
      }
    }
  };

  find = function(array, fn, context) {
    var index, value, _i, _len;
    if (fn == null) {
      fn = function(it) {
        return it;
      };
    }
    for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
      value = array[index];
      if (fn.call(context, value, index)) {
        return value;
      }
    }
  };

}).call(this);
