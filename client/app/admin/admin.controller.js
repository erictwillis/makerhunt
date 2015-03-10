'use strict';

angular.module('makerhuntApp')
  .controller('AdminCtrl', function ($scope, $http, Event, User) {
    $scope.events = [];

    Event.query(function(data) {
      $scope.events = data;
    });

    $scope.newEvent = new Event({});

    $scope.searchForUser = function(){
      console.log($scope.newEvent.username);
      if(!$scope.newEvent.username){
        return false;
      }

      //make necessary API calls here (PH & twitter)
      user = User.create({screen_name: $scope.newEvent.username}).$promise.then(function(data) {
          // $scope.newEvent.user = data;
          $scope.newEvent.username = data.username;
          $scope.newEvent.title = data.name;
          $scope.newEvent.headline = data.twitter_profile.description;
          // $scope.newEvent.ph_profile = data.ph_settings;
        }).catch(function(e) {
          console.log(e);
          alert('error');
        });

    };

    $scope.saveEvent = function(){
        if (angular.isUndefined($scope.newEvent.event_id)) {
            $scope.newEvent.$create().then(function(event) {
                $scope.events.push(event);
            });
        } else {
            $scope.newEvent.$save();
        }
    };

    $scope.editEvent = function(event){
      $scope.newEvent = event;
      $scope.action = 'Edit';
    };

    $scope.deleteEvent = function(event){
        event.$delete().then(function() {
          var i = $scope.events.indexOf(event);
          if (i == -1) 
            return 

          $scope.events.splice(i, 1);
        });
    };
});
