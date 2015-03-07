angular.module('makerhuntApp')
.directive('preload', function() {
    return {
        restrict: 'A',
        scope: false,
        priority: 0,
        link: function(scope, element, attrs) {      
            element.css('opacity', 0);
            element.on('load', function() {
                element.css('opacity', 1);
            });
        }
    }
});

