'use strict';

angular.module('makerhuntApp')
.config(function ($stateProvider) {
    $stateProvider
        .state('timeline', {
            url: "/timeline",
            views: {
                main: {
                    templateUrl: 'app/timeline/timeline.html',
                    controller: 'TimelineCtrl',
                    resolve: {
                        user: ['Auth', function(Auth) {
                            return Auth.getCurrentUser().$promise;
                        }]
                    }
                }
            }
    })
});
