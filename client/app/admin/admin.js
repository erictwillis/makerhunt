'use strict';

angular.module('makerhuntApp')
  .config(function ($stateProvider) {
      $stateProvider
          .state('admin', {
              url: "/admin",
              roles: ['admin'],
              views: {
                  main : {
                      templateUrl: "app/admin/admin.html",
                      controller: 'AdminCtrl'
                  } 
              }
          })
  });
