'use strict';

angular.module('makerhuntApp')
  .directive('mhPost', function () {
    return {
      templateUrl: 'app/components/mh-post/mh-post.html',
      restrict: 'A',
      scope: {
        post: '=',
        context: '@'
      },
      link: function (scope, element, attrs) {


        //// PURELY BAD TEST INTEGRATION THIS CAN PROBABLY BE DONE MUCH BETTER!

        scope.isSinglePost = function(){
          if(scope.context=='single'){
            console.log('single');
            return true;
          }else{
            console.log('timeline');
            return false;
          }
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
