var chai = require('chai'),
  expect = chai.expect,
  Checks = require('allex_checkslowlevellib'),
  DListBase = require('allex_doublelinkedlistbaselowlevellib'),
  Inherit = require('allex_inheritlowlevellib')(Checks.isFunction,Checks.isString).inherit,
  EventEmitter = require('allex_eventemitterlowlevellib')(DListBase,Inherit,Checks.isFunction,Checks.isArrayOfFunctions),
  DummyFunc = require('allex_functionmanipulationlowlevellib').dummyFunc,
  Fifo = require('allex_fifolowlevellib')(DListBase,Inherit),
  Timeout = require('allex_timeoutlowlevellib')(Checks.isFunction,Fifo),
  q = require('allex_qlowlevellib')(Timeout.runNext,Checks.isArray,Checks.isFunction,Inherit,DummyFunc,EventEmitter),
  Avl = require('allex_avltreelowlevellib')(DListBase,Inherit),
  Map = require('allex_maplowlevellib')(Avl,Inherit),
  DeferMap = require('..')(Map,q);

describe('\'DeferMap\' lib testing: Basic', function(){
  function onFullfilled1(dm,done,val){
    expect(dm.exists('first')).to.be.false;
    expect(val).to.be.true;
  }
  function onFullfilled2(dm,done,val){
    expect(dm.exists('first')).to.be.false;
    expect(val).to.be.true;
    done();
  }
  var rejErr = new Error('Rejected');
  function onRejected(dm,done,err){
    expect(err).to.be.equal(rejErr);
    done();
  }
  function onNotify1(myObj,value){
    myObj.value += value;
  }
  function onFullfilledWithNotify(done,myObj){
    expect(myObj.value).to.be.equal(6);
    done();
  }
  it('resolve', function(done){
    var dm = new DeferMap();
    var p1 = dm.promise('first');
    var p2 = dm.promise('second');
    var p3 = dm.promise('third');
    expect(dm.exists('first')).to.be.true;
    p1.then(onFullfilled1.bind(null,dm,done));
    p2.then(onFullfilled1.bind(null,dm,done));
    p3.then(onFullfilled2.bind(null,dm,done));
    dm.resolve('first',true); 
    dm.resolve('second',true); 
    dm.resolve('third',true); 
  });
  it('reject', function(done){
    var dm = new DeferMap();
    var p1 = dm.promise('first');
    expect(dm.exists('first')).to.be.true;
    p1.then(null,onRejected.bind(null,dm,done));
    dm.reject('first',rejErr); 
  });
  it('resolve+notify', function(done){
    var dm = new DeferMap();
    var myObj = {value:0};
    var p1 = dm.promise('first');
    expect(dm.exists('first')).to.be.true;
    p1.then(onFullfilledWithNotify.bind(null,done,myObj),onRejected.bind(null,dm,done),onNotify1.bind(null,myObj));
    dm.notify('first',1);
    dm.notify('first',2);
    dm.notify('first',3);
    dm.resolve('first',true); 
  });
});
