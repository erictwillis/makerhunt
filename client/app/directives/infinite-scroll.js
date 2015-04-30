angular.module('makerhuntApp').
    directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', '$log' , function($rootScope, $window, $timeout,$log) {
    return {
      restrict: 'A',
      scope: false,
      link: function infiniteScrollWatcher(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
        var $target = angular.element(document.querySelector(attrs.infiniteScrollTarget) || $window);

        scrollDistance = 200;
        if (attrs.infiniteScrollDistance != null) {
          scope.$watch(attrs.infiniteScrollDistance, function(value) {
            scrollDistance = parseFloat(value);
            return scrollDistance;
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled != null) {
          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        handler = function infinitScrollHandler() {
          var elementBottom, remaining, shouldScroll, windowBottom;
          windowBottom = $target.height() + $target.scrollTop();
          elementBottom = elem.height();

          remaining = (elementBottom - windowBottom) ;
          shouldScroll = remaining <= $target.height() * scrollDistance;

          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.infiniteScroll);
            } else {
              return scope.$apply(attrs.infiniteScroll);
            }
          } else if (shouldScroll) {
            checkWhenEnabled = true;
            return checkWhenEnabled;
          }
        };

        $target.on('scroll', handler);

        scope.$on('$destroy', function() {
          return $target.off('scroll', handler);
        });

        return $timeout(function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }, 0);
      }
    };
  }
]);


