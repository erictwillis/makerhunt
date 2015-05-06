'use strict';

angular.module('makerhuntApp')
  .directive('mhComment', function (Auth, Comment) {
    return {
      templateUrl: 'app/components/mh-comment/mh-comment.html',
      restrict: 'A',
      scope: {
        post: '=',
        comment: '='
      },
      link: function (scope, element, attrs) {
            scope.canDelete = function(comment) {
                return (Auth.getCurrentUser().user_id === comment.user.user_id || Auth.isAdmin());
            };

            scope.delete = function(comment) {
                Comment.delete({post_id: scope.post.post_id, comment_id: comment.comment_id}).$promise.then(function(comment) {
                    var index = scope.post.comments.indexOf(comment);
                    scope.post.comments.splice(index, 1);
                }).catch(function(e) {
                    console.debug(e);
                }).finally(function() {
                });
            }
      }
    };
  });
