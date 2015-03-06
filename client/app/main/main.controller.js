'use strict';

angular.module('makerhuntApp')
  .controller('MainCtrl', function ($scope, $http, utilities, $interval, $timeout) {

    //makerFaces

    $scope.makers = [];


    $http.get('/api/v1/makers')
      .success(function(data){
        console.log(data);
        var members = utilities.shuffle(data);
        var makers = members.slice(0, 60);

        angular.forEach(makers, function(value, key) {

          this.push(value);


        }, $scope.makers);

        console.log($scope.makers);



        $scope.makerPool = members.slice(60);

        console.log($scope.makerPool);
      })
      .error(function(data){
        console.log(data);
      });

    $interval(function(){

      utilities.switchUser($scope.makers, $scope.makerPool);


    }, 5000);






  });
