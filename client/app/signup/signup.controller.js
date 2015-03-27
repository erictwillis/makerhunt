'use strict';

angular.module('makerhuntApp')
  .controller('SignupCtrl', function ($scope, user, $timeout, Me) {
    $scope.user = user;

    $scope.step = 1;

    $scope.ph_loaded=false;

    Me.updateProductHuntData().$promise.then(function(user) {
        $scope.user = user;

        angular.forEach($scope.user.ph_settings.maker_of, function(post) {
          angular.forEach(post.makers, function(maker) {
              if (maker.username === $scope.user.username)
                return;

              $scope.teamMembers[maker.username] = maker;
          });
        });

        $scope.ph_loaded=true;
    });

    $scope.hasTeamMembers= function() {
        return (Object.keys($scope.teamMembers).length>0);
    }

    $scope.isMaker= function() {
        if ($scope.user.$resolved && $scope.user.ph_settings) {
            return ($scope.user.ph_settings.maker_of.length > 0);
        } else {
            return false;
        }
    };

    $scope.submit = function(form) {
        if (form.$invalid)
            return;

       var fn = Me.subscribe({email: $scope.user.email});

        if ($scope.isMaker()) {
            fn = Me.invite({ email: $scope.user.email });
        }

        fn.$promise.then(function() {
            $scope.goToStepThree();
        }).catch(function(e) {
            // scope.modal.button.status = 'Error sending invite!';
        }).finally(function() {
        });
    };

    //go to step two
    $scope.goToStepTwo = function(){
      $('#stepOne').addClass('animated bounceOutLeft');
        $scope.step = 2;

      $timeout(function(){
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

    $scope.teamMembers = {};
});

