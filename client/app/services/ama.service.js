'use strict';

angular.module('makerhuntApp')
  .factory('Ama', function ($resource) {
    return $resource('/api/v1/amas', {
    },
    {
      query: {
        method: 'GET',
        isArray: true,
        url: '/api/v1/amas'
      },
      get: {
        method: 'GET'
      }
  });
});
