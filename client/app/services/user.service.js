'use strict';

angular.module('makerhuntApp')
  .factory('Me', function ($resource) {
    return $resource('/api/v1/me', {
    },
    {
      get: {
        method: 'GET',
        url: '/api/v1/me'
      },
      subscribe: {
        method: 'POST',
        params: {
        },
        url: '/api/v1/me/subscribe'
      },
      updateProductHuntData: {
        method: 'POST',
        params: {
        },
        url: '/api/v1/me/update-producthunt-data'
      },
      invite: {
        method: 'POST',
        params: {
        },
        url: '/api/v1/me/invite'
      }
  });
});

angular.module('makerhuntApp')
  .factory('User', function ($resource) {
    return $resource('/api/v1/users', {
    },
    {
      create: {
        method: 'POST'
      }
  });
});
