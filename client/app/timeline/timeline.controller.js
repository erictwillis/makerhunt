'use strict';

angular.module('makerhuntApp')
.controller('TimelineCtrl', function ($rootScope, $scope, $timeout, Post, Event, Auth, user, localStorageService) {
    var offset = 0;
    var from_date = new Date();
    var since = new Date(1971, 1, 1);

    $scope.user = user;
    $scope.posts = localStorageService.get("posts") || [];

    if ($scope.posts.length > 0) {
        // update from_date with last post
        since = $scope.posts[0].created_at;
        from_date = $scope.posts[$scope.posts.length-1].created_at;
    }

    $scope.currentPost = new Post();
    $scope.commentsPost = null;
    $scope.state = null;

    $timeout(function() {
        // load posts since date
        if ($scope.state !== null) {
            return
        }

        $scope.state = 'loading';
        Post.query({ since: since },function (posts) {
            $scope.posts = posts.concat($scope.posts);

            // check if last post compares to first local storage post, check for gap.
            $scope.state = null;

            localStorageService.set('posts', $scope.posts);
        }, function(error) {
            $scope.state = 'error';
        });
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
        return (Auth.getCurrentUser().user_id === post.user.user_id || Auth.isAdmin());
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

            // update from_date with last post
            from_date = $scope.posts[$scope.posts.length-1].created_at;
            localStorageService.set('posts', $scope.posts);
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

    $rootScope.toggleuserMenu = function(){
      if(!$rootScope.dropDown){
        $('#userMenu').toggleClass('is-open');
        $('#right-sidebar').toggleClass('sidebar-blur');
        $rootScope.dropDown = 'user';
      }else{
        $('#notifications').removeClass('is-open');
        $('#userMenu').removeClass('is-open');
        $('#right-sidebar').removeClass('sidebar-blur');
        if($rootScope.dropDown === 'user'){
          $rootScope.dropDown = false;
        }
        else{
          $timeout(function(){
            $('#userMenu').toggleClass('is-open');
            $('#right-sidebar').toggleClass('sidebar-blur');
            $rootScope.dropDown = 'user';
          }, 300)
        }
      }
    };


    //// JQUERY POWERED USER CARD
    $scope.userDetailOpen = false;
    $scope.userDetailState = 'profile';

    $scope.openUserDetails = function(pID){
      if($scope.userDetailOpen){
        $('.ui_user-card-wrapper').removeClass('user-card-open');
        $scope.userDetailOpen = false;
      }
      $scope.userDetailState = 'profile';
      $('#'+pID).addClass('user-card-open');
      $scope.userDetailOpen = true;
    };
    $scope.closeUserDetails = function(pID){
      $('#'+pID).removeClass('user-card-open');
      $scope.userDetailOpen = false;
    }

});

angular.module('makerhuntApp')
.controller('NotificationsCtrl', function ($rootScope, $scope, $timeout, $interval, Comment, Me) {
    $scope.notifications = [];
    $scope.unseen_notifications = [];

    this.update = function() {
        Me.notifications(function(data) {
            $scope.notifications = data;

            angular.forEach($scope.notifications, function(notification) {
                if (notification.seen) {
                    return;
                }
                $scope.unseen_notifications.push(notification);
            });
        });
    };

    $interval(this.update, 30000);
    $timeout(this.update, 0);

    $scope.toggleNotifications = function(){
      if(!$rootScope.dropDown) {
        $('#notifications').toggleClass('is-open');
        $('#right-sidebar').toggleClass('sidebar-blur');
        $rootScope.dropDown = 'notif';
      }else{
        $('#notifications').removeClass('is-open');
        $('#userMenu').removeClass('is-open');
        $('#right-sidebar').removeClass('sidebar-blur');
        if($rootScope.dropDown === 'notif'){
          $rootScope.dropDown = false;
        }
        else{
          $timeout(function(){
            $('#notifications').toggleClass('is-open');
            $('#right-sidebar').toggleClass('sidebar-blur');
            $rootScope.dropDown = 'notif';
          }, 300)
        }
      }

      Me.notificationsSeen(function(data) {
        // $scope.notifications = data;
        $scope.unseen_notifications = [];
      });
    };

});

angular.module('makerhuntApp')
.controller('CommentsCtrl', function ($scope, $timeout, Comment, Auth) {
    $scope.canDelete = function(comment) {
        return (Auth.getCurrentUser().user_id === comment.user.user_id || Auth.isAdmin());
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
