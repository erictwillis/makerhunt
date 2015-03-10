'use strict';

angular.module('makerhuntApp', [
        'ng',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'angularMoment',
        'ui.router'
]).config(function ($locationProvider, $httpProvider, $stateProvider, $urlRouterProvider, $compileProvider) {
    $urlRouterProvider
        .otherwise("/");

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
}).factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
        return {
            // Add authorization token to headers
            request: function (config) {
                config.headers = config.headers || {};
                return config;
            },

        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if(response.status === 401) {
                // $location.path('/login');
                // remove any stale tokens
                // $cookies.remove('token');
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }
    };
}).run(function ($rootScope, $location, $state, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (!angular.isDefined(next.roles)) {
                return;
            }

            if (loggedIn) {
                return;
            }

            $state.go("main");
        });
    });
}).run(function($window){

  if ($window.navigator.userAgent.match(/OS X.*Safari/) && ! $window.navigator.userAgent.match(/Chrome/)) {
    $('body').addClass('safari');
  }

});


angular.module('makerhuntApp').filter('firstname', function() {
      return function(input) {
          if (angular.isUndefined(input)) {
              return "";
          }

          return input.split(' ')[0];
    };
});

angular.module('makerhuntApp').filter('utc', function() {
      return function(input) {
          if (angular.isUndefined(input)) {
              return "";
          }

          return moment(input).utc();
    };
});


var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== "object") return input;

    for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === "string" && moment(value).isValid()) {
            input[key] = moment(value).toDate();
        } else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}


angular.module('makerhuntApp').config(["$httpProvider", function ($httpProvider) {
    $httpProvider.defaults.transformResponse.push(function(responseData, headers){
        if (headers()['content-type']==='application/json') {
            convertDateStringsToDates(responseData);
        }
        return responseData;
    });
}]);
