'use strict';

angular.module('makerhuntApp')
  .service('utilities', function ($timeout) {

    return {

      //shuffle a given array
      shuffle: function(array){
        var tmp, current, top = array.length;

        if(top) while(--top) {
          current = Math.floor(Math.random() * (top + 1));
          tmp = array[current];
          array[current] = array[top];
          array[top] = tmp;
        }

        return array;
      },
      //switch user function
      switchUser: function(array1, array2){
        if(!array1.length || !array2.length){
          return false;
        }
        var user1, user2, rnd1, rnd2;

        rnd1 = Math.floor(Math.random()*array1.length);
        rnd2 = Math.floor(Math.random()*array2.length);

        user1 = array1[rnd1];
        user2 = array2[rnd2];

        //console.log(user1);

        $('#'+user1.id).addClass('flipOutX');

        $timeout(function(){
          array1[rnd1] = user2;
          array2[rnd2] = user1;

          //console.log(user1);

        }, 1000);
      }
    };


  });
