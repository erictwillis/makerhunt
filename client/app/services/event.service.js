'use strict';

angular.module('makerhuntApp')
  .factory('Event', function ($resource) {
    return $resource('/api/v1/events', {
    },
    {
      query: {
        method: 'GET',
        isArray: true,
        url: '/api/v1/events'
      },
      create: {
        method: 'POST',
        url: '/api/v1/events'
      },
      get: {
        method: 'GET',
        params: {
            id: ""
        },
        url: '/api/v1/events/{id}'
      }
  });
});
