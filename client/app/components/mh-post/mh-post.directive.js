'use strict';

angular.module('makerhuntApp')
  .directive('mhPost', function () {
    return {
      templateUrl: 'app/components/mh-post/mh-post.html',
      restrict: 'A',
      scope: {
        post: '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
