'use strict';

angular.module('makerhuntApp')
.controller('TimelineCtrl', function ($scope, $timeout, Post) {
    var offset = 0;
    var from_date = new Date();

    $scope.posts = [];
    $scope.currentPost = new Post();
    $scope.state = null;

    $timeout(function() {
        $scope.load();
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

    $scope.load = function() {
        if ($scope.state !== null) {
            return
        }

        $scope.state = 'loading';
        Post.query({ from_date: from_date, offset: offset },function (posts) {
            if (posts.length == 0) {
                $scope.state='no-more';
                return;
            }
            $scope.posts.push(posts);
            $scope.state = null;
            offset += posts.length;
        }, function(error) {
            $scope.state = 'error';
        });
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
