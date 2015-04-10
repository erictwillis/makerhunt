'use strict';

angular.module('makerhuntApp')
.controller('TimelineCtrl', function ($scope, $timeout, Post, Event, user) {
    var offset = 0;
    var from_date = new Date();

    $scope.user = user;
    $scope.posts = [];
    $scope.currentPost = new Post();
    $scope.commentsPost = null;
    $scope.state = null;

    $timeout(function() {
        $scope.load();
    });

    $scope.$on('closeAll', function() {
        $scope.commentsPost = null;
    });

    $scope.events = [];
    $timeout(function() {
        Event.query(function(data) {
            angular.forEach(data, function(event) {
                event = angular.extend(event, { till_date: moment(event.from_date).add(1,'hour') });
                $scope.events.push(event);
            });
        });
    });

    $scope.eventsFilter = function( item) {
            return (moment(item.from_date).isAfter(moment()));
    };

    $scope.sortEvents = function(event) {
           return event.from_date;
    };

    $scope.sortComments = function(comment) {
           return comment.created_at;
    };

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
            $scope.posts.push.apply($scope.posts, posts);
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
    };

    $scope.share = function(form) {
        if (form.$invalid){
            return;
        }

        $('#newPost-submit').addClass('newPost-posting');
        $scope.currentPost.$create().then(function(post) {
            $scope.posts.unshift(post);
            $scope.currentPost = new Post();
            form.$setPristine();
            $('#newPost-submit').removeClass('newPost-posting');
        }).catch(function(e) {
            console.debug(e);
        }).finally(function() {
        });
    };


    $scope.isCommentsPost = function(post){
        return ($scope.commentsPost === post);
    };

    $scope.openComments = function(post){
        $scope.commentsPost = post;
    }


});

angular.module('makerhuntApp')
.controller('CommentsCtrl', function ($scope, $timeout, Comment) {
    $scope.canDelete = function(post) {
        return (true);
    }

    $scope.delete = function(comment) {
        Comment.delete({post_id: comment.post_id, comment_id: comment.comment_id}).$promise.then(function(comment) {
            var index = $scope.post.comments.indexOf(comment);
            $scope.post.comments.splice(index, 1);
        }).catch(function(e) {
            console.debug(e);
        }).finally(function() {
        });
    }
});

angular.module('makerhuntApp')
.controller('CommentCtrl', function ($scope, $timeout, Comment) {
    $scope.comment = new Comment( {
        post_id: $scope.post.post_id,
        body: ""
    });

    $scope.submit = function(form) {
        if (form.$invalid)
            return;

        $scope.comment.$create().then(function(comment) {
            $scope.post.comments.unshift(comment);
            $scope.comment = new Comment({
                post_id: $scope.post.post_id
            });
            form.$setPristine();
        }).catch(function(e) {
            console.debug(e);
        }).finally(function() {
        });
    };



});
