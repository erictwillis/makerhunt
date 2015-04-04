'use strict';

angular.module('makerhuntApp')
  .controller('TimelineCtrl', function ($scope) {

    $scope.posts = [
      {
        id: 1,
        createdAt: '3h ago',
        status: 'We just published “Maker Hunt’s AMA with Mattan Griffel from One Month” https://medium.com/@MakerHunt/maker-hunt-s-ama-with-mattan-griffel-from-one-month-b23dcdf2eea4?source=tw-a32a58630f2c-1428011480867 @mattangriffel @onemonthedu',
        via: {
          provider: 'twitter', //twitter, slack, direct
          id: 'the source id', //for tweet intent actions
          url: 'url to the source' // for linking to the slack source
        },
        user: {
          id: 1,
          name: 'Eric Willis',
          screenName: 'erictwillis',
          profilePic: 'https://pbs.twimg.com/profile_images/2272007191/wvrexvyjybx1zx9flwi7_400x400.jpeg',
          makerOf: [
            {
              id: 1,
              name: 'MakerHunt',
              redirectUrl: 'https://www.makerhunt.co',
              discussionUrl: 'http://producthunt.com/posts/makerhunt'
            }
          ]
        },
        card: {
          id: 1,
          type: 'article',
          source: 'medium',
          headline: 'Maker Hunt’s AMA with Mattan Griffel from One Month',
          text: 'We have Mattan Griffel — CEO and Co-founder of One Month and member of the Forbes 30 under 30 club.',
          img: 'https://o.twimg.com/2/proxy.jpg?t=HBhLaHR0cHM6Ly9kMjYyaWxiNTFobHR4MC5jbG91ZGZyb250Lm5ldC9tYXgvODAwLzEqbXRlZGdxZGMwMXB5RE84MjN3b1JhZy5qcGVnFMAHFMAHABYAEgA&s=qjdmbobDVkLrR2DPxFdf-RdvTnovshb_z3quQaucE1U'
        },
        comments: {}, //to be added
        commentCount: 3
      },
      {
        id: 1,
        createdAt: '3h ago',
        status: 'We just published “Maker Hunt’s AMA with Mattan Griffel from One Month” https://medium.com/@MakerHunt/maker-hunt-s-ama-with-mattan-griffel-from-one-month-b23dcdf2eea4?source=tw-a32a58630f2c-1428011480867 @mattangriffel @onemonthedu',
        via: {
          provider: 'twitter', //twitter, slack, direct
          id: 'the source id', //for tweet intent actions
          url: 'url to the source' // for linking to the slack source
        },
        user: {
          id: 2,
          name: 'Jonas Daniels',
          screenName: 'sleinadsanoj',
          profilePic: 'https://pbs.twimg.com/profile_images/583567395161268224/ZRqzE0zf.jpg',
          makerOf: [
            {
              id: 1,
              name: 'MakerHunt',
              redirectUrl: 'https://www.makerhunt.co',
              discussionUrl: 'http://producthunt.com/posts/makerhunt'
            }
          ]
        },
        card: {
          id: 1,
          type: 'article',
          source: 'medium',
          headline: 'Maker Hunt’s AMA with Mattan Griffel from One Month',
          text: 'We have Mattan Griffel — CEO and Co-founder of One Month and member of the Forbes 30 under 30 club.',
          img: 'https://o.twimg.com/2/proxy.jpg?t=HBhLaHR0cHM6Ly9kMjYyaWxiNTFobHR4MC5jbG91ZGZyb250Lm5ldC9tYXgvODAwLzEqbXRlZGdxZGMwMXB5RE84MjN3b1JhZy5qcGVnFMAHFMAHABYAEgA&s=qjdmbobDVkLrR2DPxFdf-RdvTnovshb_z3quQaucE1U'
        },
        comments: {}, //to be added
        commentCount: 3
      }
    ];

  });
