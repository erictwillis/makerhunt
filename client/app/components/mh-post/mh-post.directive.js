'use strict';

angular.module('makerhuntApp')
  .directive('mhPost', function () {
    return {
      templateUrl: 'app/components/mh-post/mh-post.html',
      restrict: 'A',
      scope: {
        post: '=',
        type: '@'
      },
      link: function (scope, element, attrs) {
        scope.isSinglePost = function(){
            return scope.type === 'single';
        };

        scope.isCommentsPost = function(post){
          return (scope.commentsPost === post);
        };

        scope.openComments = function(post){
          scope.commentsPost = post;
        };

      }
    };
  });
