'use strict';

describe('Directive: modal', function () {

  // load the directive's module and view
  beforeEach(module('makerhuntApp'));
  beforeEach(module('app/directives/modal/modal.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<modal></modal>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the modal directive');
  }));
});