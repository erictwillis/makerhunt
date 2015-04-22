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

    $scope.eventsFilter = function(item) {
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
    };

    $scope.canDelete = function(post) {
        return (true);
    };

    $scope.edit = function(post) {
        alert("edit");
    };

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
    };

    $scope.hasLiked = function(post) {
        return (post.liked_by.indexOf($scope.user.user_id)!=-1);
    };

    $scope.like = function(post) {
        if ($scope.hasLiked(post)) {
            post.$unlike().then(function(data) {
                angular.extend(post, data);
            }).catch(function(e) {
                console.debug(e);
            }).finally(function() {
            });
        } else {
            post.$like().then(function(data) {
                angular.extend(post, data);
            }).catch(function(e) {
                console.debug(e);
            }).finally(function() {
            });
        }
    };

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
    };

    ////STUPID HACK TO FIX THE FIXED HEADER ON THE TIMELINE

    $('body').css('-webkit-transform', 'none');


    //// jQUERY powered notification open & closing

    $scope.toggleNotifications = function(){
      if(!$scope.dropDown) {
        $('#notification-center').toggleClass('is-open');
        $('#right-sidebar').toggleClass('sidebar-blur');
        $scope.dropDown = 'notif';
      }else{
        $('#notification-center').removeClass('is-open');
        $('#userMenu').removeClass('is-open');
        $('#right-sidebar').removeClass('sidebar-blur');
        if($scope.dropDown === 'notif'){
          $scope.dropDown = false;
        }
        else{
          $timeout(function(){
            $('#notification-center').toggleClass('is-open');
            $('#right-sidebar').toggleClass('sidebar-blur');
            $scope.dropDown = 'notif';
          }, 300)
        }
      }
    };
    $scope.toggleuserMenu = function(){
      if(!$scope.dropDown){
        $('#userMenu').toggleClass('is-open');
        $('#right-sidebar').toggleClass('sidebar-blur');
        $scope.dropDown = 'user';
      }else{
        $('#notification-center').removeClass('is-open');
        $('#userMenu').removeClass('is-open');
        $('#right-sidebar').removeClass('sidebar-blur');
        if($scope.dropDown === 'user'){
          $scope.dropDown = false;
        }
        else{
          $timeout(function(){
            $('#userMenu').toggleClass('is-open');
            $('#right-sidebar').toggleClass('sidebar-blur');
            $scope.dropDown = 'user';
          }, 300)
        }
      }
    };

    ////(delayed) static notification array

    $timeout(function(){
      $scope.notifications = [
        {
          user: {
            img: 'https://pbs.twimg.com/profile_images/583567395161268224/ZRqzE0zf.jpg',
            name: 'Jonas Daniels'
          },
          action: 'commented on',
          target: {
            type: 'post'
          }
        },
        {
          user: {
            img: 'https://pbs.twimg.com/profile_images/583567395161268224/ZRqzE0zf.jpg',
            name: 'Jonas Daniels'
          },
          action: 'commented on',
          target: {
            type: 'post'
          }
        },
        {
          user: {
            img: 'https://pbs.twimg.com/profile_images/583567395161268224/ZRqzE0zf.jpg',
            name: 'Jonas Daniels'
          },
          action: 'commented on',
          target: {
            type: 'post'
          }
        }
      ];

    }, 2000);




});

angular.module('makerhuntApp')
.controller('CommentsCtrl', function ($scope, $timeout, Comment) {
    $scope.canDelete = function(post) {
        return (true);
    };

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
