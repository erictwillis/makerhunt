'use strict';

angular.module('makerhuntApp')
  .config(function ($stateProvider) {
    $stateProvider
        .state('timeline:post', {
            url: "/@:username/:post_id",
            roles: ['user', 'maker'],
            views: {
                main: {
                    templateUrl: 'app/post/post.html',
                    controller: 'PostCtrl',
                    resolve: {
                        user: ['Auth', function(Auth) {
                            return Auth.getCurrentUser().$promise;
                        }]
                    }
                }
            }
        })
  });
