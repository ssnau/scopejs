var Scope = require('../src');
var sinon = require('sinon');
var assert = require('assert');
function next(func){
  setTimeout(function(){
    func();
  }, 10);
}

describe('test', function(){
  var scope;
  beforeEach(function(){
    scope = new Scope();
  });

  it('test one', function(done) {
    var callback = sinon.spy();
    var hello;
    scope.$watch('hello', function(val){
      hello = val;
      callback();
    });
    scope.hello = 1;
    scope.$apply();
    next(function(){
      assert.equal(true, callback.calledOnce);
      assert.equal(hello, 1);
      done();
    });
  });

  it('watch after change', function(done) {
    var callback = sinon.spy();
    var hello;
    scope.hello = 1;
    scope.$watch('hello', function(val){
      hello = val;
      callback();
    });
    next(function(){
      assert.equal(true, callback.calledOnce);
      done();
    });
  });

  it('test expression', function(done) {
    var callback = sinon.spy();
    var ret;
    scope.$watch('hello + world', function(val){
      ret = val;
      callback();
    });
    scope.hello = 1;
    scope.world = 3;
    next(function(){
      assert.equal(true, callback.calledOnce);
      assert.equal(ret, 4);
      done();
    });
  });

  it('test NaN', function(done) {
    var callback = sinon.spy();
    var ret;
    scope.$watch('hello-1', function(val){
      ret = val;
      callback();
    });
    scope.hello = "hello";
    next(function(){
      assert.equal(true, callback.calledOnce);
      assert.equal(String(ret), 'NaN');
      done();
    });
  });

  it('inifinity loop', function(done) {
    var callback = sinon.spy();
    var ret = 0;
    scope.$watch('hello', function(val){
      scope.hello = val + 100;
      ret++;
      callback();
    });
    scope.hello = "hello";
    setTimeout(function(){
      assert.equal(ret, 10);
      done();
    }, 100);

  });

  it('watch function', function(done) {

    var callback = sinon.spy();
    var ret = 0;
    scope.$watch(function() {
      return scope.hello;
    }, function(val){
      ret = val;
      callback();
    });

    scope.hello = 10;
    next(function(){
      assert.equal(ret, 10);
      done();
    });
  });

});
