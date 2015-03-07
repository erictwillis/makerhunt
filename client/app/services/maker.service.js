'use strict';

angular.module('makerhuntApp')
  .factory('Maker', function ($resource) {
    return $resource('/api/v1/makers', {
    },
    {
      query: {
        method: 'GET',
        isArray: true
      },
      get: {
        method: 'GET'
      }
  });
});
