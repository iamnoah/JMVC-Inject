(function() {

  module("inject", {
    setup: function() {
      return $('#testContent').html($('#testHtml').text());
    }
  });

  test("injecting functions", function() {
    var injector;
    expect(1);
    injector = inject({
      name: 'foo',
      factory: inject.require('bar', function(bar) {
        return bar.baz;
      })
    }, {
      name: 'bar',
      factory: function() {
        return {
          baz: 123
        };
      }
    });
    return injector('foo', function(foo) {
      return equals(foo, 123);
    })();
  });

  test("async dependencies", function() {
    var injector;
    expect(1);
    injector = inject({
      name: 'foo',
      factory: inject.require('bar', function(bar) {
        var def;
        def = $.Deferred();
        setTimeout(function() {
          return def.resolve(bar.baz);
        }, 200);
        return def;
      })
    }, {
      name: 'bar',
      factory: function() {
        var def;
        def = $.Deferred();
        setTimeout(function() {
          return def.resolve({
            baz: 123
          });
        }, 200);
        return def;
      }
    });
    stop();
    return injector('foo', function(foo) {
      equals(foo, 123);
      return start();
    })();
  });

  test("injecting methods", function() {
    var injector;
    injector = inject({
      name: 'foo',
      factory: function() {
        var def;
        def = $.Deferred();
        setTimeout(function() {
          return def.resolve({
            bar: 123
          });
        }, 200);
        return def;
      }
    }, {
      name: 'TestClass',
      inject: {
        thing: 'foo'
      }
    });
    $.Class('TestClass', {}, {
      foo: injector('thing', function(thing) {
        equals(thing.bar, 123);
        return start();
      })
    });
    stop();
    new TestClass().foo();
    return delete window.TestClass;
  });

  test("injecting controller methods scoped by selector", function() {
    var finish, i, injector;
    expect(2);
    injector = inject({
      name: 'foo',
      factory: function() {
        var def;
        def = $.Deferred();
        setTimeout(function() {
          return def.resolve({
            bar: 123
          });
        }, 200);
        return def;
      }
    }, {
      name: 'bar',
      factory: function() {
        return {
          bar: 456
        };
      }
    }, {
      name: 'TestController',
      inject: {
        thing: 'foo'
      }
    }, {
      name: 'TestController',
      controller: '.testThing2',
      inject: {
        thing: 'bar'
      }
    });
    $.Controller('TestController', {}, {
      init: injector('thing', function(foo) {
        this.element.html(foo.bar);
        return finish();
      })
    });
    stop();
    i = 0;
    finish = function() {
      if (++i >= 2) {
        equals($('.testThing').html(), '123');
        equals($('.testThing2').html(), '456');
        return start();
      }
    };
    $('.testThing').test();
    $('.testThing2').test();
    return delete window.TestController;
  });

  test("options substitution", function() {
    var injector;
    injector = inject({
      name: 'foo',
      factory: function() {
        var def;
        def = $.Deferred();
        setTimeout(function() {
          return def.resolve({
            bar: 123
          });
        }, 200);
        return def;
      }
    });
    $.Controller('TestController2', {
      defaults: {
        thing: 'foo'
      }
    }, {
      init: injector('{thing}', function(foo) {
        equals(foo.bar, 123);
        return start();
      })
    });
    stop(500);
    $('.testThing').test2();
    return delete window.TestController2;
  });

  test("parameterized factories", function() {
    var injector;
    injector = inject({
      name: 'foo()',
      factory: function(input) {
        var def;
        def = $.Deferred();
        setTimeout(function() {
          return def.resolve({
            bar: 123 + input
          });
        }, 200);
        return def;
      }
    }, {
      name: 'TestController3',
      inject: {
        thing: 'foo(blah)'
      }
    });
    $.Controller('TestController3', {
      defaults: {
        blah: 111
      }
    }, {
      init: injector('thing', function(foo) {
        equals(foo.bar, 234);
        return start();
      })
    });
    stop(500);
    $('.testThing').test3();
    return delete window.TestController3;
  });

  test("singleton: false", function() {
    var calls, injector, requested;
    requested = false;
    calls = 0;
    injector = inject({
      name: 'foo',
      singleton: false,
      factory: function() {
        return ++calls;
      }
    });
    injector('foo', function(i) {
      return equals(i, 1);
    })();
    injector('foo', function(i) {
      return equals(i, 2);
    })();
    return injector('foo', function(i) {
      return equals(i, 3);
    })();
  });

  test("clearCache", function() {
    var calls, injector, requested, singleton;
    singleton = inject.cache();
    requested = false;
    calls = 0;
    injector = inject({
      name: 'foo',
      factory: singleton('foo', function(input) {
        return ++calls;
      })
    });
    injector('foo', function(i) {
      return equals(i, 1);
    })();
    injector('foo', function(i) {
      return equals(i, 1);
    })();
    singleton.clear('foo');
    return injector('foo', function(i) {
      return equals(i, 2);
    })();
  });

  test("eager: true", function() {
    var injector, requested, singleton;
    expect(2);
    singleton = inject.cache();
    requested = false;
    injector = inject({
      name: 'foo',
      eager: true,
      factory: singleton('foo', function(input) {
        ok(!requested, 'created before request');
        return 123;
      })
    });
    requested = true;
    return injector('foo', function(foo) {
      return equals(123, foo);
    })();
  });

  test("context sharing", function() {
    var contextA, contextB, shared, singleton;
    singleton = inject.cache();
    shared = inject({
      name: 'sharedFoo',
      factory: singleton('sharedFoo', function() {
        return {
          qux: 987
        };
      })
      /*
      	sharing context is as simple as using the shared context to inject
      	factories in another context
      */
    });
    contextA = inject({
      name: 'bar',
      factory: shared('sharedFoo', function(foo) {
        return {
          bar: foo
        };
      })
    });
    contextB = inject({
      name: 'foo',
      /* the shared context can be used as a factory in another context
      */
      factory: shared('sharedFoo', function(foo) {
        return foo;
      })
    }, {
      name: 'baz',
      factory: inject.require('foo', function(foo) {
        return {
          baz: foo
        };
      })
    }, {
      name: 'foo2',
      factory: function() {
        return {
          qux: 654
        };
      }
    }, {
      name: 'multipleContexts',
      /*
      			you can also mix other contexts with the current context
      			however, inject.require() must be on the outside if you want it to inject from the injector being defined
      			note the resulting order of the arguments
      */
      factory: inject.require('foo2', shared('sharedFoo', function(foo, foo2) {
        return String(foo.qux) + String(foo2.qux);
      }))
    });
    contextA('bar', function(bar) {
      return equals(bar.bar.qux, 987);
    })();
    contextB('baz', function(baz) {
      return equals(baz.baz.qux, 987);
    })();
    return contextB('multipleContexts', function(result) {
      return equals(result, '987654');
    })();
  });

  test("setting the context", function() {
    var injector, injector2;
    injector = inject({
      name: 'foo',
      factory: function() {
        return 123;
      }
    });
    injector2 = inject({
      name: 'foo',
      factory: function() {
        return 456;
      }
    });
    return inject.useInjector(injector, function() {
      return inject.require('foo', function(foo) {
        equals(foo, 123);
        return inject.useInjector(injector2, function() {
          return inject.require('foo', function(foo2) {
            return equals(foo2, 456);
          })();
        })();
      })();
    })();
  });

  test("capturing the current context", function() {
    var injector;
    injector = inject({
      name: 'foo',
      factory: function() {
        return 123;
      }
    });
    stop();
    return inject.useInjector(injector, function() {
      return setTimeout(inject.useCurrent(inject.require('foo', function(foo) {
        equals(foo, 123);
        return start();
      })), 200);
    })();
  });

  test("error on no context", function() {
    expect(1);
    try {
      return inject.require('foo', function(foo2) {
        return ok(false);
      })();
    } catch (expected) {
      return ok(true, 'error');
    }
  });

  test("context inside a named function", function() {
    var injector;
    injector = inject({
      name: 'foo',
      factory: function() {
        return 123;
      }
    }, {
      name: 'bar',
      inject: {
        foo: 'baz'
      }
    }, {
      name: 'baz',
      factory: function() {
        return 456;
      }
    });
    return injector.named('bar')('foo', function(foo) {
      equals(foo, 456);
      return inject.require('foo', function(realFoo) {
        return equals(realFoo, 123);
      })();
    })();
  });

}).call(this);
