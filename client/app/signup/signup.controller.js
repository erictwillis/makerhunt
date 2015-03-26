'use strict';

angular.module('makerhuntApp')
  .controller('SignupCtrl', function ($scope, $timeout) {
    $scope.step = 0;

      user.$promise.then(function(user) {
          $scope.user = user;
      });

    $scope.isMaker= function() {
        if ($scope.response.user.$resolved) {
            return ($scope.response.user.ph_settings.maker_of_count > 0);
        } else {
            return false;
        }
    };

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

/*
angular.module('makerhuntApp')
  .directive('modal', function ($timeout, $interval, Me) {
    return {
      templateUrl: 'app/directives/modal/modal.html',
      restrict: 'A',
      scope: {
          response: '=response'
      },
      controller: function ($scope) {
      },
      link: function (scope, element, attrs) {
          // this needs to be moved to appropriate controller

        scope.modal= {};

        scope.response.user.$promise.then(function() {
              scope.email = scope.response.user.email;

              if (scope.isMaker()){
                  scope.modal.button.status = "Send Invite";
              } else {
                  scope.modal.button.status = "Subscribe";
              }
        });

        scope.modal.button = { status: "" };
        scope.state = "normal";

        scope.submit = function(form){

          if(scope.modalEvaluated === true){
            // return false;
          }

          scope.modalEvaluated = true;

           scope.target = $('#modal-submit-btn');
          var wait = null;

          $(scope.target).addClass('busy');

        scope.$on('$destroy', function() {
            if (wait !== null) {
                return;
            }

          $(scope.target).removeClass('busy');
            $interval.cancel(wait);
        });


          if(scope.isMaker()){

            var i = 0;

            // need to make proper object for this
            wait = $interval(function() {
                var messages = ["Fetching envelope...", "Sending..."];

                scope.modal.button.status = messages[i];

                if (i < messages.length - 1) {
                    i++;
                };
            }, 1000);

            Me.invite({ email: scope.response.user.email }).$promise.then(function() {
              scope.modal.button.status = 'Invite sent!';
              $(scope.target).removeClass('busy');
              $(scope.target).addClass('done');
            }).catch(function(e) {
              scope.modal.button.status = 'Error sending invite!';
            }).finally(function() {
                $interval.cancel(wait);
            });
          } else {
            var i = 0;

            wait = $interval(function() {
                var messages = ["Contacting servers..", "Filling out application...", "Checking lists..."];

                scope.modal.button.status = messages[i];

                if (i < messages.length) {
                    i++;
                };
            }, 200);

            Me.subscribe({email: scope.response.user.email}).$promise.then(function() {
                scope.modal.button.status = 'Success!';
              $(scope.target).removeClass('busy');
                $(scope.target).addClass('done');
            }).catch(function(e) {
                scope.modal.button.status = 'Error!';
            }).finally(function() {
                $interval.cancel(wait);
            });
          }
        }
      }
    };
>>>>>>> Working on new signup flow
  });
*/
