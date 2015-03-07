"use strict";angular.module("makerhuntApp",["ngCookies","ngResource","ngSanitize","ngRoute"]).config(["$routeProvider","$locationProvider","$httpProvider",function(a,b,c){a.otherwise({redirectTo:"/"}),b.html5Mode(!0),c.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},a},responseError:function(a){return 401===a.status?(d.path("/login"),$cookies.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$routeChangeStart",function(a,d){c.isLoggedInAsync(function(a){d.authenticate&&!a&&b.path("/login")})})}]),angular.module("makerhuntApp").controller("MainCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Ama","Maker",function(a,b,c,d,e,f,g,h){a.makers=[],a.currentUser=f.getCurrentUser(),a.amas=[],g.query(function(b){a.amas=b}),h.query(function(b){console.log(b);var d=c.shuffle(b),e=d.slice(0,60);angular.forEach(e,function(a){this.push(a)},a.makers),console.log(a.makers),a.makerPool=d.slice(60),console.log(a.makerPool)},function(a){console.log(a)}),d(function(){c.switchUser(a.makers,a.makerPool)},5e3)}]),angular.module("makerhuntApp").config(["$routeProvider",function(a){a.when("/",{templateUrl:"app/main/main.html",controller:"MainCtrl"})}]),angular.module("makerhuntApp").factory("Ama",["$resource",function(a){return a("/api/v1/amas",{},{query:{method:"GET",isArray:!0,url:"/api/v1/amas"},get:{method:"GET"}})}]),angular.module("makerhuntApp").factory("Auth",["$location","$rootScope","$http","User","$cookies","$q",function(a,b,c,d,e,f){var g={};return angular.isDefined(e.token)&&(g=d.get()),{login:function(a,b){var h=b||angular.noop,i=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=d.get(),i.resolve(a),h()}).error(function(a){return this.logout(),i.reject(a),h(a)}.bind(this)),i.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return d.save(a,function(b){return e.put("token",b.token),g=d.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("makerhuntApp").factory("Maker",["$resource",function(a){return a("/api/v1/makers",{},{query:{method:"GET",isArray:!0},get:{method:"GET"}})}]),angular.module("makerhuntApp").factory("User",["$resource",function(a){return a("/api/v1/me",{},{get:{method:"GET"}})}]),angular.module("makerhuntApp").service("utilities",["$timeout",function(a){return{shuffle:function(a){var b,c,d=a.length;if(d)for(;--d;)c=Math.floor(Math.random()*(d+1)),b=a[c],a[c]=a[d],a[d]=b;return a},switchUser:function(b,c){if(!b.length||!c.length)return!1;var d,e,f,g;f=Math.floor(Math.random()*b.length),g=Math.floor(Math.random()*c.length),d=b[f],e=c[g],$("#"+d.id).addClass("flipOutX"),a(function(){b[f]=e,c[g]=d},1e3)}}}]),angular.module("makerhuntApp").controller("NavbarCtrl",["$scope","$location",function(a,b){a.menu=[{title:"Home",link:"/"}],a.isCollapsed=!0,a.isActive=function(a){return a===b.path()}}]),angular.module("makerhuntApp").run(["$templateCache",function(a){a.put("app/main/main.html",'<div id=mainView><div class=makerFaces><img id={{maker.id}} class="makerFaces-face animated" ng-src={{maker.profile.image_192}} ng-repeat="maker in makers" ng-class-even="\'flipInX\'" ng-class-odd="\'flipInY\'" alt=""></div>Hi, {{ currentUser.name }} {{ currentUser }}<ul><li ng-repeat="ama in amas">{{ ama.title }}</li></ul></div>'),a.put("components/navbar/navbar.html",'<div class="navbar navbar-default navbar-static-top" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click="isCollapsed = !isCollapsed"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href="/" class=navbar-brand>makerhunt</a></div><div collapse=isCollapsed class="navbar-collapse collapse" id=navbar-main><ul class="nav navbar-nav"><li ng-repeat="item in menu" ng-class="{active: isActive(item.link)}"><a ng-href={{item.link}}>{{item.title}}</a></li></ul></div></div></div>')}]);