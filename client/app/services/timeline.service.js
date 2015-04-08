'use strict';

angular.module('makerhuntApp')
  .factory('Post', function ($resource) {
    return $resource('/api/v1/timeline', {
        post_id: '@post_id'
    },
    {
      query: {
        method: 'GET',
        isArray: true,
        url: '/api/v1/timeline'
      },
      create: {
        method: 'POST',
        url: '/api/v1/timeline'
      },
      delete: {
        method: 'DELETE',
        url: '/api/v1/timeline/:post_id'
      },
      save: {
        method: 'PUT',
        url: '/api/v1/timeline/:post_id'
      },
      get: {
        method: 'GET',
        params: {
            post_id: ""
        },
        url: '/api/v1/timeline/:post_id'
      }
  });
});

