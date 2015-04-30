'use strict';

describe('Directive: mhComment', function () {

  // load the directive's module and view
  beforeEach(module('makerhuntApp'));
  beforeEach(module('app/components/mh-comment/mh-comment.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mh-comment></mh-comment>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mhComment directive');
  }));
});