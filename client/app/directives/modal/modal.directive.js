'use strict';

angular.module('makerhuntApp')
  .directive('modal', function ($timeout) {
    return {
      templateUrl: 'app/directives/modal/modal.html',
      restrict: 'A',
      scope: {},
      link: function (scope, element, attrs) {

        //DRAFT RESPONSE OBJECT FOR SUCCESS + MAKER
        /*
         scope.response = {
         status: 'success',
         isMaker: true,
         user: {id: 1, username: 'imcatnoone', firstName: 'Cat', imgURI: 'https://pbs.twimg.com/profile_images/542004858744602624/qT_jO1YF.jpeg', emailAdress: 'thecat@makerhunt.co'}
         };

        //DRAFT RESPONSE OBJECT FOR SUCCESS - MAKER


        scope.response = {
          status: 'success',
          isMaker: false,
          user: {id: 1, username: 'imcatnoone', firstName: 'Cat', imgURI: 'https://pbs.twimg.com/profile_images/542004858744602624/qT_jO1YF.jpeg', emailAdress: 'thecat@makerhunt.co'}
        };
         */


        //DRAFT RESPONSE OBJECT FOR ERROR

        scope.response = {status: 'error', code: 'errorCode'};




        //MODAL functionality -- the evaluate function needs to actually do something. (other than animating the button) :D

        scope.modal= {};
        scope.modal.button = {};

        if(scope.response.isMaker) {

          scope.modal.button.status = 'Send Invite';

        }
        if(!scope.response.isMaker){
          scope.modal.button.status = 'Subscribe';
        }
        if(scope.response.status === 'error'){
          scope.modal.button.status = 'Report this to us!';
        }

        //evaluate function start

        scope.evaluateModal = function($event){

          if(scope.modalEvaluated === true){
            return false;
          }

          scope.modalEvaluated = true;

          var target = $event.target;



          if(scope.response.isMaker){
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
          if(!scope.response.isMaker && scope.response === 'success'){
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
