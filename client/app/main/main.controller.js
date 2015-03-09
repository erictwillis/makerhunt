'use strict';

angular.module('makerhuntApp')
  .controller('MeCtrl', function ($scope, $http, utilities, $interval, $timeout, Auth, Event, Maker, user) {
        $scope.response = {
          status: 'success',
          user: user
        };

        $('body').addClass('open-overlay');

        $scope.closeModal = function(){
          $('body').removeClass('open-overlay');
        }
});

angular.module('makerhuntApp')
  .controller('ErrorCtrl', function ($scope, $http, utilities, $interval, $timeout, Auth, Event, Maker) {
        $scope.response = {
          status: 'error',
          user: Auth.getCurrentUser()
        };

        $('body').addClass('open-overlay');

        $scope.closeModal = function(){
          $('body').removeClass('open-overlay');
        }
});

angular.module('makerhuntApp')
  .controller('MainCtrl', function ($scope, $http, utilities, $interval, $timeout, Auth, Event, Maker) {
    $scope.currentUser = Auth.getCurrentUser();

    $scope.state = 'upcoming';

    $scope.events = [];
    Event.query(function(data) {
        $scope.events = data;
    });

    $scope.makers = [];
    $timeout(function() {
        Maker.query(function(data){
            var members = utilities.shuffle(data);
            var makers = members.slice(0, 60);

            angular.forEach(makers, function(value, key) {
              this.push(value);
            }, $scope.makers);
            $scope.makerPool = members.slice(60);
        }, function(error){
            console.log(error);
        });

        $interval(function(){
          utilities.switchUser($scope.makers, $scope.makerPool);
        }, 5000);
    }, 0);

    $scope.eventsFilter = function( item) {
            if ($scope.state == 'upcoming') {
                return (moment(item.from_date).isAfter(moment()));
            } else if ($scope.state == 'previous') {
                return (moment(item.from_date).isBefore(moment()));
            } else {
                return false;
            }
    };
});
