'use strict';

angular.module('makerhuntApp')
.config(function ($stateProvider) {
    $stateProvider
        .state('main', {
            url: "/",
            views: {
                main : {
                    templateUrl: "app/main/main.html",
                    controller: 'MainCtrl'
                }
            }
        })
    /*
    .state('main:me', {
        url: "/me",
        roles: ['user', 'maker'],
        views: {
            main : {
                templateUrl: "app/main/main.html",
                controller: 'MainCtrl'
            },
            modal: {
                templateUrl: "app/modals/me.html",
                controller: 'MeCtrl',
                resolve: {
                    user: ['Auth', function(Auth) {
                        return Auth.getCurrentUser();
                    }]
                }
            }
        }
    })
    .state('main:error', {
        url: "/error",
        views: {
            main : {
                templateUrl: "app/main/main.html",
                controller: 'MainCtrl'
            },
            modal: {
                templateUrl: "app/modals/error.html",
                controller: 'ErrorCtrl'
            }
        }
    })*/
});
