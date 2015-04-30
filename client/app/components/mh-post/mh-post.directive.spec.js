'use strict';

describe('Directive: mhPost', function () {

  // load the directive's module and view
  beforeEach(module('makerhuntApp'));
  beforeEach(module('app/components/mh-post/mh-post.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mh-post></mh-post>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mhPost directive');
  }));
});