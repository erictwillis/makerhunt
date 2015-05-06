'use strict';

angular.module('makerhuntApp')
  .directive('mhHoverCard', function () {
    return {
      templateUrl: 'app/components/mh-hoverCard/mh-hoverCard.html',
      restrict: 'A',
      scope: {
        user: '='
      },
      link: function (scope, element, attrs) {
        scope.userDetailOpen = false;
        scope.userDetailState = 'profile';

        scope.closeUserDetails = function(){
          $('.ui_user-card-wrapper').removeClass('user-card-open');
          scope.userDetailOpen = false;
        }
      }
    };
  });
