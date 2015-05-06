'use strict';

angular.module('makerhuntApp')
.service('PostsService', function($http, $timeout, Post, $q, $filter) {
    this.from_date = new Date();
    this.since = new Date(1971, 1, 1);
    this.state = null;
    this.items = {};
    
    this.getPosts = function() {
        var items = [];
        angular.forEach(this.items, function(post) {
            items.push(post);
        });

        return (items);
    };

    this.add = function(post) {
        this.items[post.post_id] = post;
    }

    this.delete = function(post) {
        this.items[post.post_id];
    }

    this.load = function() {
        var deferred = $q.defer();
        if (this.state !== null && false) {
            deferred.reject();
            return deferred.promise;
        }

        this.state = 'loading';

        var self = this;

        $timeout(function() {
            deferred.notify(self.getPosts());
        });

        Post.query({ since: this.since },function (posts) {
            angular.forEach(posts, function(post) {
                self.items[post.post_id] = angular.extend(self.items[post.post_id] || new Post(), post)
            });

            var items = self.getPosts();
            self.from_date = items[items.length-1].created_at;
            self.state = null;
            deferred.resolve(items);
        }, function(error) {
            self.state = 'error';
            deferred.reject();
        });

        return deferred.promise;
    };


    this.get = function(params) {
        var deferred = $q.defer();
        if (this.state !== null && false) {
            deferred.reject();
            return deferred.promise;
        }

        this.state = 'loading';

        var self = this;

        // check if in cache
        $timeout(function() {
            var post = self.items[params.post_id];
            if (!angular.isDefined(post)) {
                return;
            }

            deferred.notify(post);
        });

        Post.get(params,function (data) {
            self.state = null;
            var post = self.items[data.post_id] || data;
            angular.extend(post, data);
            deferred.resolve(post);
        }, function(error) {
            self.state = 'error';
            deferred.reject();
        });

        return deferred.promise;
    };
});


angular.module('makerhuntApp')
.controller('TimelineCtrl', function ($rootScope, $scope, $timeout, Post, Event, Auth, user, localStorageService, PostsService) {
    $scope.user = user;
    $scope.posts = PostsService.getPosts();
    $scope.state = PostsService.state;

    /*
    $scope.$watch(PostsService.state, function() {
        $scope.state = PostsService.state;
    });*/

    PostsService.load().then(function success(items) {
        $scope.posts = items;
    }, function error(error) {
    }, function notify(items) {
        $scope.posts = items;
    });

    $scope.getState = function() {
        return (PostsService.state);
    }

    $scope.currentPost = new Post();
    $scope.commentsPost = null;

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

    $scope.sortPosts = function(post) {
           return post.created_at;
    };

    $scope.sortEvents = function(event) {
           return event.from_date;
    };

    $scope.sortComments = function(comment) {
           return comment.created_at;
    };

    $scope.edit = function(post) {
        alert("edit");
    };

    $scope.share = function(form) {
        if (form.$invalid){
            return;
        }

        $('#newPost-submit').addClass('newPost-posting');
        $scope.currentPost.$create().then(function(post) {
            PostsService.add(post);

            $scope.posts = PostsService.getPosts();

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
