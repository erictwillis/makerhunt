'use strict';

angular.module('makerhuntApp')
  .directive('preload', function() {
    return {
      restrict: 'A',
      scope: false,
      priority: 0,
      link: function (scope, element, attrs) {
        //element.addClass('hidden');
        element.on('load', function () {
          element.addClass('fadeIn');
        });
      }
    }
  });
