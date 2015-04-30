'use strict';

angular.module('makerhuntApp')
  .directive('mhComment', function () {
    return {
      templateUrl: 'app/components/mh-comment/mh-comment.html',
      restrict: 'A',
      scope: {
        comment: '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
