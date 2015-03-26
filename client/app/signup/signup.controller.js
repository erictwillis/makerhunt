'use strict';

angular.module('makerhuntApp')
  .controller('SignupCtrl', function ($scope, $timeout) {
    $scope.step = 0;

    $scope.userName = 'imcatnoone';
    $scope.userPic = 'https://pbs.twimg.com/profile_images/542004858744602624/qT_jO1YF.jpeg';
    $scope.userBio = 'Co-Founder & Design @LiberioApp • Big on side-projects • Advisor • Building meaningful stuff with my partner in crime @blehnert';

    $timeout(function(){
      $scope.step = 1;
      $scope.isMaker = false;
    },3000);



    //go to step two
    $scope.goToStepTwo = function(){

      $('#stepOne').addClass('animated bounceOutLeft');
      $timeout(function(){
        $scope.step = 2;
        $('#stepOne').addClass('hidden');
        $('#stepTwo').removeClass('hidden');
        $('#stepTwo').addClass('animated bounceInRight');
      }, 1000);

    };

    $scope.goToStepThree = function(){
      $('#stepTwo').addClass('bounceOutLeft');
      $timeout(function(){
        $scope.step = 3;
        $('#stepTwo').addClass('hidden');
        $('#stepThree').removeClass('hidden');
        $('#stepThree').addClass('animated bounceInRight');
      }, 1000);
    };


    //teamMember temp array

    $scope.teamMembers = [
      {username: 'sleinadsanoj', name: 'Jonas Daniels', profile_pic: 'https://pbs.twimg.com/profile_images/574379151760580609/ZM1ZA9ci.jpeg'},
      {username: 'erictwillis', name: 'Eric Willis', profile_pic: 'https://pbs.twimg.com/profile_images/2272007191/wvrexvyjybx1zx9flwi7_400x400.jpeg'}
    ];
  });
