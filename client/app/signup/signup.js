'use strict';

angular.module('makerhuntApp')
.config(function ($stateProvider) {
    $stateProvider
        .state('signup', {
            url: '/signup',
            roles: ['user', 'maker'],
            views: {
                main : {
                    templateUrl: "app/signup/signup.html",
                    controller: 'SignupCtrl',
                    resolve: {
                        user: ['Auth', function(Auth) {
                            return Auth.getCurrentUser().$promise;
                        }]
                    }
                }
            }
        });
});
