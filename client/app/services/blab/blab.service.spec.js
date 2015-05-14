'use strict';

describe('Service: blab', function () {

  // load the service's module
  beforeEach(module('makerhuntApp'));

  // instantiate service
  var blab;
  beforeEach(inject(function (_blab_) {
    blab = _blab_;
  }));

  it('should do something', function () {
    expect(!!blab).toBe(true);
  });

});
