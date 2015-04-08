'use strict';

angular.module('makerhuntApp')
.controller('TimelineCtrl', function ($scope, Post) {
    $scope.posts = [];

    $scope.currentPost = new Post();

    Post.query(function (posts) {
        $scope.posts = posts;
    });

    $scope.canEdit = function(post) {
        return (false);
    }

    $scope.canDelete = function(post) {
        return (true);
    }

    $scope.edit = function(post) {
        alert("edit");
    }

    $scope.delete = function(post) {
        post.$delete().then(function(post) {
            var index = $scope.posts.indexOf(post);
            $scope.posts.splice(index, 1);     
        }).catch(function(e) {
            console.debug(e);
        }).finally(function() {
        });
    }

    $scope.share = function(form) {
        if (form.$invalid)
            return;

        $scope.currentPost.$create().then(function(post) {
            $scope.posts.unshift(post);
            $scope.currentPost = new Post();
            form.$setPristine();
        }).catch(function(e) {
            console.debug(e);
        }).finally(function() {
        });
    }
});
