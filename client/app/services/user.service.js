'use strict';

angular.module('makerhuntApp')
  .factory('User', function ($resource) {
    return $resource('/api/v1/me', {
    },
    {
      get: {
        method: 'GET'
      }
  });
});
