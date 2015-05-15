'use strict';

angular.module('makerhuntApp')
  .service('blab', function ($http) {

    return{
      live: function(liveStreams){

        var prevLiveStreams = liveStreams;

        if(!prevLiveStreams){
          var prevLiveStreams = [];
          var liveStreams = [];
        }

        console.log(liveStreams);

        $http.get('https://api.blab.im/stream/list')
          .success(function(data){
            var streams = data.streams;


            angular.forEach(streams, function(stream){

              if(stream.caller_count > 0){

                if(prevLiveStreams.length > 0){
                  angular.forEach(liveStreams, function(prevStream){
                    if(prevStream.stream_id === stream.stream_id && stream.updated_at > prevStream.stream_id){
                      liveStreams.splice(prevStream);
                      liveStreams.push(stream);
                    }
                  });
                }else{
                  liveStreams.push(stream);
                }


              }else{

                angular.forEach(liveStreams, function(prevStream){
                  if(prevStream.stream_id === stream.stream_id){
                    liveStreams.splice(prevStream);
                  }
                });


              }
            });

            console.log(liveStreams);

            return liveStreams;
          })
          .error(function(data){
            return data;
          })

      }
    }

  });
