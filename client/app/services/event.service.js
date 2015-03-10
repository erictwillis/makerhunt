'use strict';

angular.module('makerhuntApp')
  .factory('Event', function ($resource) {
    return $resource('/api/v1/events', {
        event_id: '@event_id'
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
      delete: {
        method: 'DELETE',
        url: '/api/v1/events/:event_id'
      },
      save: {
        method: 'PUT',
        url: '/api/v1/events/:event_id'
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
