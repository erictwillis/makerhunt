'use strict';

angular.module('makerhuntApp')
  .controller('MainCtrl', function ($scope, $http, utilities, $interval, $timeout, Auth, Ama, Maker) {

    //makerFaces

    $scope.makers = [];

    $scope.currentUser = Auth.getCurrentUser();

    $scope.amas = [];

    Ama.query();

    Maker.query(function(data){ 
        console.log(data);
        var members = utilities.shuffle(data);
        var makers = members.slice(0, 60);

        angular.forEach(makers, function(value, key) {

          this.push(value);


        }, $scope.makers);

        console.log($scope.makers);



        $scope.makerPool = members.slice(60);

        console.log($scope.makerPool);
    }, function(error){
        console.log(error);
     });

    $interval(function(){

      utilities.switchUser($scope.makers, $scope.makerPool);


    }, 5000);






  });
