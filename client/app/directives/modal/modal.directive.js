'use strict';

angular.module('makerhuntApp')
  .directive('modal', function ($timeout) {
    return {
      templateUrl: 'app/directives/modal/modal.html',
      restrict: 'A',
      scope: {
          response: '=response'
      },
      controller: function ($scope) {
          $scope.isMaker= function() {
              if (angular.isDefined($scope.response.user.ph_settings.maker_of_count)) {
                  return ($scope.response.user.ph_settings.maker_of_count > 0);
              } else {
                  return false;
              }
          };
      },
      link: function (scope, element, attrs) {
        //MODAL functionality -- the evaluate function needs to actually do something. (other than animating the button) :D

          console.debug("modal", scope);

        scope.modal= {};
        scope.modal.button = { status: "" };

        //evaluate function start

        scope.evaluateModal = function($event){

          if(scope.modalEvaluated === true){
            return false;
          }

          scope.modalEvaluated = true;

          var target = $event.target;

          if(scope.isMaker()){
            $(target).addClass('busy');

            scope.modal.button.status = 'Writing Invitation...';
            $timeout(function(){
              scope.modal.button.status = 'Fetching envelope...';
            }, 2000);
            $timeout(function(){
              scope.modal.button.status = 'Sending...';
            }, 4000);
            $timeout(function(){
              scope.modal.button.status = 'Invite sent!';
              $(target).removeClass('busy');
              $(target).addClass('done');
            }, 5000);
          }
          if(!scope.isMaker() && scope.response === 'success'){
            $(target).addClass('busy');
            scope.modal.button.status = 'Contacting servers...';
            $timeout(function(){
              scope.modal.button.status = 'Filling out application...';
            }, 2000);
            $timeout(function(){
              scope.modal.button.status = 'Checking lists...';
            }, 4000);
            $timeout(function(){
              scope.modal.button.status = 'Success!';
              $(target).removeClass('busy');
              $(target).addClass('done');
            }, 5000);
          }
          else{
            scope.modal.button.status = "On it! Thank you!";
          }
        }

      }
    };
  });
