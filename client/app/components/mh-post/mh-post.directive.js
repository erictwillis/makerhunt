'use strict';

angular.module('makerhuntApp')
  .directive('mhPost', function (Auth, Post) {
    return {
      templateUrl: 'app/components/mh-post/mh-post.html',
      restrict: 'A',
      scope: {
        type: '@',
        post: '='
      },
      link: function (scope, element, attrs) {
        scope.user = Auth.getCurrentUser();

        scope.isSinglePost = function(){
            return scope.type === 'single';
        };

        scope.isCommentsPost = function(post){
          return (scope.commentsPost === post);
        };

        scope.openComments = function(post){
          scope.commentsPost = post;
        };

        scope.hasLiked = function(post) {
            return (post.liked_by.indexOf(scope.user.user_id)!=-1);
        };

        scope.canEdit = function(post) {
            return (false);
        };

        scope.canDelete = function(post) {
            return (Auth.getCurrentUser().user_id === post.user.user_id || Auth.isAdmin());
        };

        scope.delete = function(post) {
            post.$delete().then(function(post) {
                PostsService.delete(post);
            }).catch(function(e) {
                console.debug(e);
            }).finally(function() {
            });
        }

        scope.like = function(post) {
            if (scope.hasLiked(post)) {
                post.$unlike().then(function(data) {
                    angular.extend(post, data);
                }).catch(function(e) {
                    console.debug(e);
                }).finally(function() {
                });
            } else {
                post.$like().then(function(data) {
                    angular.extend(post, data);
                }).catch(function(e) {
                    console.debug(e);
                }).finally(function() {
                });
            }
        };
      }
    };
  });
