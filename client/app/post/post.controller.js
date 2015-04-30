'use strict';

angular.module('makerhuntApp')
    .controller('PostCtrl', function ($rootScope, $scope, $timeout, Post, Event, Auth, user, $stateParams) {
    $scope.post = {};
    $scope.user = user;

    $timeout(function() {
        $scope.load();
    });

    $scope.load = function() {
        Post.get({ post_id: $stateParams.post_id },function (post) {
            $scope.post = angular.extend($scope.post, post);
        }, function(error) {
        });
    };

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

});

