'use strict';

angular.module('makerhuntApp')
  .directive('modal', function ($timeout, $interval, Me) {
    return {
      templateUrl: 'app/directives/modal/modal.html',
      restrict: 'A',
      scope: {
          response: '=response'
      },
      controller: function ($scope) {
          $scope.isMaker= function() {
              return false;

              if ($scope.response.user.$resolved) {
                  return ($scope.response.user.ph_settings.maker_of_count > 0);
              } else {
                  return false;
              }
          };
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

        scope.submit = function($event){

          if(scope.modalEvaluated === true){
            // return false;
          }

          scope.modalEvaluated = true;

           scope.target = $event.target;
          var wait = null;

          $(target).addClass('busy');

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
            }, 600);

            Me.invite({ email: scope.email }).$promise.then(function() {
              scope.modal.button.status = 'Invite sent!';
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

            Me.subscribe({email: scope.email}).$promise.then(function() {
                scope.modal.button.status = 'Success!';
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
  });
