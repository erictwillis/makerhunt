'use strict';

angular.module('makerhuntApp')
  .controller('AdminCtrl', function ($scope, Ama, $http, Event) {

  //default {{action}}
    $scope.action = 'Add';

  //initialising event array

    $scope.events = [];

  //make API call to fill events from ama/event endpoint

    Event.query(function(data) {
      $scope.events = data;
    });

  //newEvent Object

    $scope.newEvent = {};

  //admin actions

    //search for username & display

    $scope.searchForUser = function(){

      console.log($scope.newEvent.username);

      if(!$scope.newEvent.username){
        return false;
      }

      //make necessary API calls here (PH & twitter)

      $http.post('/api/v1/users', {screen_name: $scope.newEvent.username})
        .success(function(data){
          $scope.newEvent.user = data;
          $scope.newEvent.description = data.twitter_profile.description;
        })
        .error(function(response){
          console.log(response);
          alert('error');
        });

      //$scope.newEvent.user = data; <-- add the relevant fields into the data
      //$scope.newEvent.description = twitter bio;

      //draft newEvent user object & newEvent description

      //$scope.newEvent.user = {id: 12345, username: 'levelsio', img_URI: 'https://pbs.twimg.com/profile_images/493609499886776320/I66hzR_K.jpeg', maker_of: [{name: 'nomadlist', url: 'http://link to PH post'}]}
      //$scope.newEvent.description = 'I make http://remoteok.io  http://nomadlist.com  http://hashtagnomads.com  http://gofuckingdoit.com  http://tubelytics.com  / 12 startups in 12 months';
    };

    //post new AMA or put edited AMA

    $scope.saveEvent = function(){

      console.log($scope.newEvent);

      if(!$scope.newEvent._id){

        //make post call
        console.log('post');

      }
      if($scope.newEvent._id){

        //make put call
        console.log('put');



        $scope.action = 'Add';

      }
    };

    //simple edit functionality, simply putting the event to edit back into the editor

    $scope.editEvent = function(event){
      $scope.newEvent = event;
      $scope.action = 'Edit';
    };

    //delete functionality

    $scope.deleteEvent = function(event){

      //make delete call with the event._id

    };






  });
