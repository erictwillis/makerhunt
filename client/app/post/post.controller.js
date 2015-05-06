'use strict';

angular.module('makerhuntApp')
    .controller('PostCtrl', function ($rootScope, $scope, $timeout, Event, Auth, user, $stateParams, localStorageService, PostsService) {
    $scope.post = {};

    PostsService.get({ post_id: $stateParams.post_id }).then(function success(post) {
        $scope.post = post;
    }, function error(error) {
    }, function notify(post) {
        $scope.post = post;
    });

    $scope.user = user;

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

