'use strict';

angular.module('makerhuntApp')
  .factory('Comment', function ($resource) {
    return $resource('/api/v1/timeline/:post_id/comments', {
        post_id: '@post_id'
    },
    {
      create: {
        method: 'POST'
      },
      delete: {
        method: 'DELETE',
        url: '/api/v1/timeline/:post_id/comments/:comment_id'
      },
  });
});

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
      comment: {
        method: 'POST',
        url: '/api/v1/timeline/:post_id/comments'
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

