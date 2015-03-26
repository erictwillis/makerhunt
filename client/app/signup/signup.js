'use strict';

angular.module('makerhuntApp')
.config(function ($stateProvider) {
    $stateProvider
        .state('signup', {
            url: '/signup',
            views: {
                main : {
                    templateUrl: "app/signup/signup.html",
                    controller: 'SignupCtrl',
                    resolve: {
                        user: ['Auth', function(Auth) {
                            return Auth.getCurrentUser();
                        }]
                    }
                }
            }
        });
});
