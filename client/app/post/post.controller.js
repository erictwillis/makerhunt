'use strict';

angular.module('makerhuntApp')
    .controller('PostCtrl', function ($rootScope, $scope, $timeout, Post, Event, Auth, user, $stateParams) {
    $scope.post = {};

    $timeout(function() {
        $scope.load();
    });

    $scope.load = function() {
        Post.get({ post_id: $stateParams.post_id },function (post) {
            $scope.post = angular.extend($scope.post, post);
        }, function(error) {
        });
    };

});

