'use strict';

angular.module('makerhuntApp')
.config(function ($stateProvider) {
    $stateProvider
        .state('main', {
            url: '/',
            views: {
                main : {
                    templateUrl: 'app/main/main.html',
                    controller: 'MainCtrl'
                }
            }
        })
});
