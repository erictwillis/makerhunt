"use strict";function convertDateStringsToDates(a){if("object"!=typeof a)return a;for(var b in a)if(a.hasOwnProperty(b)){var c,d=a[b];"string"==typeof d&&(c=d.match(/\d{4}\-\d{2}\-\d{2}T\d{2}\:\d{2}\:\d{2}(\.\d{3})?[+-]\d{2}\:\d{2}/))?a[b]=moment(d).toDate():"object"==typeof d&&convertDateStringsToDates(d)}}angular.module("makerhuntApp",["ng","ngCookies","ngResource","ngSanitize","angularMoment","angularytics","ui.router"]).config(["$locationProvider","$httpProvider","$stateProvider","$urlRouterProvider","$compileProvider","AngularyticsProvider",function(a,b,c,d,e,f){d.otherwise("/"),f.setEventHandlers(["Console","GoogleUniversal"]),e.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/),a.html5Mode(!0),b.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b){return{request:function(a){return a.headers=a.headers||{},a},responseError:function(a){return b.reject(401===a.status?a:a)}}}]).run(["$rootScope","$location","$state","Auth","Angularytics",function(a,b,c,d,e){a.$on("$stateChangeStart",function(){window.Intercom("update")}),e.init(),a.$on("$stateChangeStart",function(a,b){d.isLoggedInAsync(function(a){angular.isDefined(b.roles)&&(a||c.go("main"))})})}]).run(["$window",function(a){a.navigator.userAgent.match(/OS X.*Safari/)&&!a.navigator.userAgent.match(/Chrome/)&&$("body").addClass("safari")}]),angular.module("makerhuntApp").directive("closeAll",["$rootScope","$window","$timeout","$log",function(a,b){return{restrict:"A",scope:!1,link:function(){var c=angular.element(b);c.on("click",function(b){var c=$(b.target);return 0!=c.closest(".popup").length?!0:void a.$apply(function(){a.$broadcast("closeAll")})})}}}]),angular.module("makerhuntApp").filter("firstname",function(){return function(a){return angular.isUndefined(a)?"":a.split(" ")[0]}}),angular.module("makerhuntApp").filter("utc",function(){return function(a){return angular.isUndefined(a)?"":moment(a).utc()}});var regexIso8601=/^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;angular.module("makerhuntApp").config(["$httpProvider",function(a){a.defaults.transformResponse.push(function(a,b){return"application/json"===b()["content-type"]&&convertDateStringsToDates(a),a})}]),angular.module("makerhuntApp").controller("AdminCtrl",["$scope","$http","Event","User",function(a,b,c,d){a.events=[],c.query(function(b){a.events=b}),a.newEvent=new c({}),a.searchForUser=function(){if(console.log(a.newEvent.username),!a.newEvent.username)return!1;d.create({screen_name:a.newEvent.username}).$promise.then(function(b){a.newEvent.username=b.username,a.newEvent.title=b.name,a.newEvent.description=b.twitter_profile.description,a.newEvent.ph_profile=b.ph_settings})["catch"](function(a){console.log(a),alert("error")})},a.saveEvent=function(){angular.isUndefined(a.newEvent.event_id)?a.newEvent.$create().then(function(b){a.events.push(b)}):a.newEvent.$save()},a.editEvent=function(b){a.newEvent=b,a.action="Edit"},a.deleteEvent=function(b){b.$delete().then(function(){var c=a.events.indexOf(b);-1!=c&&a.events.splice(c,1)})}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",roles:["admin"],views:{main:{templateUrl:"app/admin/admin.html",controller:"AdminCtrl"}}})}]),angular.module("makerhuntApp").directive("infiniteScroll",["$rootScope","$window","$timeout","$log",function(a,b,c){return{restrict:"A",scope:!1,link:function(d,e,f){var g,h,i,j,k=angular.element(document.querySelector(f.infiniteScrollTarget)||b);return i=0,null!=f.infiniteScrollDistance&&d.$watch(f.infiniteScrollDistance,function(a){return i=parseFloat(a)}),j=!0,g=!1,null!=f.infiniteScrollDisabled&&d.$watch(f.infiniteScrollDisabled,function(a){return j=!a,j&&g?(g=!1,h()):void 0}),h=function(){var b,c,h,l;return l=k.height()+k.scrollTop(),b=e.height(),c=b-l,h=c<=k.height()*i,h&&j?a.$$phase?d.$eval(f.infiniteScroll):d.$apply(f.infiniteScroll):h?g=!0:void 0},k.on("scroll",h),d.$on("$destroy",function(){return k.off("scroll",h)}),c(function(){return f.infiniteScrollImmediateCheck?d.$eval(f.infiniteScrollImmediateCheck)?h():void 0:h()},0)}}}]),angular.module("makerhuntApp").directive("modal",["$timeout","$interval","Me",function(a,b,c){return{templateUrl:"app/directives/modal/modal.html",restrict:"A",scope:{response:"=response"},controller:["$scope",function(a){a.isMaker=function(){return a.response.user.$resolved?a.response.user.ph_settings.maker_of_count>0:!1}}],link:function(a){a.modal={},a.response.user.$promise.then(function(){a.email=a.response.user.email,a.modal.button.status=a.isMaker()?"Send Invite":"Subscribe"}),a.modal.button={status:""},a.state="normal",a.submit=function(){a.modalEvaluated===!0,a.modalEvaluated=!0,a.target=$("#modal-submit-btn");var d=null;if($(a.target).addClass("busy"),a.$on("$destroy",function(){null===d&&($(a.target).removeClass("busy"),b.cancel(d))}),a.isMaker()){var e=0;d=b(function(){var b=["Fetching envelope...","Sending..."];a.modal.button.status=b[e],e<b.length-1&&e++},1e3),c.invite({email:a.response.user.email}).$promise.then(function(){a.modal.button.status="Invite sent!",$(a.target).removeClass("busy"),$(a.target).addClass("done")})["catch"](function(){a.modal.button.status="Error sending invite!"})["finally"](function(){b.cancel(d)})}else{var e=0;d=b(function(){var b=["Contacting servers..","Filling out application...","Checking lists..."];a.modal.button.status=b[e],e<b.length&&e++},200),c.subscribe({email:a.response.user.email}).$promise.then(function(){a.modal.button.status="Success!",$(a.target).removeClass("busy"),$(a.target).addClass("done")})["catch"](function(){a.modal.button.status="Error!"})["finally"](function(){b.cancel(d)})}}}}}]),angular.module("makerhuntApp").directive("preload",function(){return{restrict:"A",scope:!1,priority:0,link:function(a,b){b.on("load",function(){b.addClass("fadeIn")})}}}),angular.module("makerhuntApp").controller("MeCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker","user",function(a,b,c,d,e,f,g,h,i){a.response={status:"success",user:i},$("body").addClass("open-overlay"),a.closeModal=function(){$("body").removeClass("open-overlay")}}]),angular.module("makerhuntApp").controller("ErrorCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker",function(a,b,c,d,e,f){a.response={status:"error",user:f.getCurrentUser()},$("body").addClass("open-overlay"),a.closeModal=function(){$("body").removeClass("open-overlay")}}]),angular.module("makerhuntApp").controller("MainCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker",function(a,b,c,d,e,f,g,h){a.currentUser=f.getCurrentUser(),a.state="upcoming",a.events=[],g.query(function(b){angular.forEach(b,function(b){b=angular.extend(b,{till_date:moment(b.from_date).add(1,"hour")}),a.events.push(b)})}),a.makers=[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],e(function(){h.query(function(b){var d=c.shuffle(b),e=d.slice(0,60);a.makers=e,a.makerPool=d.slice(60)},function(a){console.log(a)}),d(function(){c.switchUser(a.makers,a.makerPool)},5e3)},0),a.productsFilter=function(a){return"http://www.producthunt.com/posts/intercom-3"===a.discussion_url?!1:!0},a.eventsFilter=function(b){return"upcoming"==a.state?moment(b.from_date).isAfter(moment()):"previous"==a.state?moment(b.from_date).isBefore(moment()):!1},a.sortEvents=function(a){return a.from_date},a.openCalendarOptions=function(b){return a.openCalendar===b?(a.openCalendar=!1,!1):(a.openCalendar=!1,void(a.openCalendar=b))}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("main",{url:"/",views:{main:{templateUrl:"app/main/main.html",controller:"MainCtrl"}}})}]),angular.module("makerhuntApp").factory("Auth",["$location","$rootScope","$http","Me","$cookies","$q",function(a,b,c,d,e,f){var g=d.get();return g.$promise.then(function(){window.Intercom("boot",{app_id:"npm19nez",name:g.name,email:g.email,created_at:moment(g.created_at).unix()}),window.Intercom("update")}),{login:function(a,b){var d=b||angular.noop,h=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=User.get(),h.resolve(a),d()}).error(function(a){return this.logout(),h.reject(a),d(a)}.bind(this)),h.promise},logout:function(){e.remove("token"),g={}},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return-1!=["sleinadsanoj","erictwillis","remco_verhoef"].indexOf(g.username)}}}]),angular.module("makerhuntApp").factory("Event",["$resource",function(a){return a("/api/v1/events",{event_id:"@event_id"},{query:{method:"GET",isArray:!0,url:"/api/v1/events"},create:{method:"POST",url:"/api/v1/events"},"delete":{method:"DELETE",url:"/api/v1/events/:event_id"},save:{method:"PUT",url:"/api/v1/events/:event_id"},get:{method:"GET",params:{id:""},url:"/api/v1/events/{id}"}})}]),angular.module("makerhuntApp").factory("Maker",["$resource",function(a){return a("/api/v1/makers",{},{query:{method:"GET",isArray:!0},get:{method:"GET"}})}]),angular.module("makerhuntApp").factory("Comment",["$resource",function(a){return a("/api/v1/timeline/:post_id/comments",{post_id:"@post_id"},{create:{method:"POST"},"delete":{method:"DELETE",url:"/api/v1/timeline/:post_id/comments/:comment_id"}})}]),angular.module("makerhuntApp").factory("Post",["$resource",function(a){return a("/api/v1/timeline",{post_id:"@post_id"},{query:{method:"GET",isArray:!0,url:"/api/v1/timeline"},create:{method:"POST",url:"/api/v1/timeline"},comment:{method:"POST",url:"/api/v1/timeline/:post_id/comments"},"delete":{method:"DELETE",url:"/api/v1/timeline/:post_id"},save:{method:"PUT",url:"/api/v1/timeline/:post_id"},get:{method:"GET",params:{post_id:""},url:"/api/v1/timeline/:post_id"}})}]),angular.module("makerhuntApp").factory("Me",["$resource",function(a){return a("/api/v1/me",{},{get:{method:"GET",url:"/api/v1/me"},subscribe:{method:"POST",params:{},url:"/api/v1/me/subscribe"},updateProductHuntData:{method:"POST",params:{},url:"/api/v1/me/update-producthunt-data"},invite:{method:"POST",params:{},url:"/api/v1/me/invite"}})}]),angular.module("makerhuntApp").factory("User",["$resource",function(a){return a("/api/v1/users",{},{create:{method:"POST"}})}]),angular.module("makerhuntApp").service("utilities",["$timeout",function(a){return{shuffle:function(a){var b,c,d=a.length;if(d)for(;--d;)c=Math.floor(Math.random()*(d+1)),b=a[c],a[c]=a[d],a[d]=b;return a},switchUser:function(b,c){if(!b.length||!c.length)return!1;var d,e,f,g;f=Math.floor(Math.random()*b.length),g=Math.floor(Math.random()*c.length),d=b[f],e=c[g],$("#"+d.id).addClass("fadeOut"),a(function(){b[f]=e,c[g]=d},1e3)}}}]),angular.module("makerhuntApp").controller("SignupCtrl",["$scope","user","$timeout","Me","Angularytics",function(a,b,c,d,e){a.user=b,a.step=1,a.ph_loaded=!1,d.updateProductHuntData().$promise.then(function(b){a.user=b,angular.forEach(a.user.ph_settings.maker_of,function(b){angular.forEach(b.makers,function(b){b.username!==a.user.username&&(a.teamMembers[b.username]=b)})}),a.ph_loaded=!0}),a.hasTeamMembers=function(){return Object.keys(a.teamMembers).length>0},a.isMaker=function(){return a.user.$resolved&&a.user.ph_settings?a.user.ph_settings.maker_of.length>0:!1},a.submit=function(b){if(!b.$invalid){var c=null;a.isMaker()?(c=d.invite({email:a.user.email}).$promise,e.trackEvent("Signup flow","Invited")):(c=d.subscribe({email:a.user.email}).$promise,e.trackEvent("Signup flow","Subscribed")),c.then(function(){a.goToStepThree()})["catch"](function(){})["finally"](function(){})}},a.goToStepTwo=function(){$("#stepOne").addClass("animated bounceOutLeft"),c(function(){a.step=2,e.trackEvent("Signup flow","Step 2"),$("#stepOne").addClass("hidden"),$("#stepTwo").removeClass("hidden"),$("#stepTwo").addClass("animated bounceInRight")},1e3)},a.goToStepThree=function(){$("#stepTwo").addClass("bounceOutLeft"),c(function(){a.step=3,e.trackEvent("Signup flow","Step 3"),$("#stepTwo").addClass("hidden"),$("#stepThree").removeClass("hidden"),$("#stepThree").addClass("animated bounceInRight")},1e3)},a.teamMembers={}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("signup",{url:"/signup",roles:["user","maker"],views:{main:{templateUrl:"app/signup/signup.html",controller:"SignupCtrl",resolve:{user:["Auth",function(a){return a.getCurrentUser().$promise}]}}}})}]),angular.module("makerhuntApp").controller("TimelineCtrl",["$scope","$timeout","Post","Event","user",function(a,b,c,d,e){var f=0,g=new Date;a.user=e,a.posts=[],a.currentPost=new c,a.commentsPost=null,a.state=null,b(function(){a.load()}),a.$on("closeAll",function(){a.commentsPost=null}),a.events=[],b(function(){d.query(function(b){angular.forEach(b,function(b){b=angular.extend(b,{till_date:moment(b.from_date).add(1,"hour")}),a.events.push(b)})})}),a.eventsFilter=function(a){return moment(a.from_date).isAfter(moment())},a.sortEvents=function(a){return a.from_date},a.sortComments=function(a){return a.created_at},a.canEdit=function(){return!1},a.canDelete=function(){return!0},a.edit=function(){alert("edit")},a.load=function(){null===a.state&&(a.state="loading",c.query({from_date:g,offset:f},function(b){return 0==b.length?void(a.state="no-more"):(a.posts.push.apply(a.posts,b),a.state=null,void(f+=b.length))},function(){a.state="error"}))},a["delete"]=function(b){b.$delete().then(function(b){var c=a.posts.indexOf(b);a.posts.splice(c,1)})["catch"](function(a){console.debug(a)})["finally"](function(){})},a.share=function(b){b.$invalid||($("#newPost-submit").addClass("newPost-posting"),a.currentPost.$create().then(function(d){a.posts.unshift(d),a.currentPost=new c,b.$setPristine(),$("#newPost-submit").removeClass("newPost-posting")})["catch"](function(a){console.debug(a)})["finally"](function(){}))},a.isCommentsPost=function(b){return a.commentsPost===b},a.openComments=function(b){a.commentsPost=b}}]),angular.module("makerhuntApp").controller("CommentsCtrl",["$scope","$timeout","Comment",function(a,b,c){a.canDelete=function(){return!0},a["delete"]=function(b){c["delete"]({post_id:b.post_id,comment_id:b.comment_id}).$promise.then(function(b){var c=a.post.comments.indexOf(b);a.post.comments.splice(c,1)})["catch"](function(a){console.debug(a)})["finally"](function(){})}}]),angular.module("makerhuntApp").controller("CommentCtrl",["$scope","$timeout","Comment",function(a,b,c){a.comment=new c({post_id:a.post.post_id,body:""}),a.submit=function(b){b.$invalid||a.comment.$create().then(function(d){a.post.comments.unshift(d),a.comment=new c({post_id:a.post.post_id}),b.$setPristine()})["catch"](function(a){console.debug(a)})["finally"](function(){})}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("timeline",{url:"/timeline",views:{main:{templateUrl:"app/timeline/timeline.html",controller:"TimelineCtrl",resolve:{user:["Auth",function(a){return a.getCurrentUser().$promise}]}}}})}]),angular.module("makerhuntApp").run(["$templateCache",function(a){a.put("app/admin/admin.html",'<div id=adminView><div class=container><div class=row><div class="offset-by-one ten columns"><h2 class=admin-headline>MakerHunt Admin Interface</h2><h4>{{action}} AMA</h4><form><div class=row><div class="six columns"><label for=username>Username</label><input class=u-full-width placeholder="username (no @)" id=username ng-model=newEvent.username></div><div class="six columns"><input class="button-default btn-search" type=submit value="Search for User" ng-click=searchForUser();></div><div class="twelve columns"><label for=full-name>Full Name (pre-filled on search)</label><input class=u-full-width placeholder="Full Name" id=full-name ng-model=newEvent.title></div><div class="twelve columns"><label for=event-date>AMA Date (local time)</label><input class="u-full-width input--event-date" type=datetime-local placeholder="username (no @)" id=event-date ng-model=newEvent.from_date></div></div><div class="twelve columns"><label for=link>Link</label><input class=u-full-width placeholder=Link id=link ng-model=newEvent.link></div><label for=description>Description</label><textarea class=u-full-width placeholder="will be pre-filled from twitter bio, but can be changed..." id=description ng-model=newEvent.description></textarea><input class=button-primary type=submit value=Save ng-click=saveEvent();></form></div><!-- AMA LIST START --><div class=amaList><div class=ama-wrapper ng-repeat="ama in events"><div class=row><div class="six columns"><h5 class=ama--timestamp>{{ ama.from_date }}</h5></div><div class="six columns"><button class=btn-default ng-click=editEvent(ama);>Edit</button> <button class=btn-warning ng-click=deleteEvent(ama);>Delete</button></div></div><div class=ama><div class=row><div class="twelve columns"><!--<div class="ama--pic--wrapper">--><img class="u-max-full-width ama--pic" ng-src="{{ama.ph_profile.image_url[\'88px@3X\']}}" alt="@{{ama.username}}"><!--</div>\n                <div class="ama--content--wrapper">--><h2 class=ama--maker-name>{{ama.title}} <small class=ama--maker-username><a ng-href=https://twitter.com/{{ama.username}} target=_blank>@{{ama.username}}</a></small></h2><p class=ama--description>{{ama.description}}</p><!--</div>--><div class=maker-of--wrapper><h6 class=ama--maker-headline ng-show=ama.ph_profile.maker_of.length>Maker</h6><ul class=maker-of-list><li class=maker-of-list--item ng-repeat="product in ama.ph_profile.maker_of"><a ng-href={{product.discussion_url}}>{{product.name}}</a></li></ul></div></div></div></div></div></div><!-- AMA LIST END --></div></div></div>'),a.put("app/directives/modal/modal.html",'<div ng-switch=response.status><div class=modal ng-switch-when=success><form name=form ng-submit=submit(form) novalidate><div class=modal-img--wrapper><img class=modal-user--pic ng-src="{{response.user.image_url[\'88px@3X\']}}" alt="{{response.user.username}}"><div class=modal-makerBadge ng-show=isMaker()>M</div></div><h2 class=modal-headline>Hey {{response.user.name | firstname}},</h2><p class=modal-message ng-show=isMaker()>If the email adress below is correct, click to request your invite. If not, click the box to easily change it.</p><p class=modal-message ng-show=!isMaker()>It seems like you don\'t have a product on ProductHunt yet. You can still sign up for our newsletter below.</p><input class=modal-input type=email name=email ng-model=response.user.email required> <span class=error-txt ng-show=form.email.$error.required>Please enter a valid email address.</span> <span class=error-txt ng-show=form.email.$error.email>Please enter a valid email address.</span> <button id=modal-submit-btn class=modal-button ng-class="{subscribe : !isMaker(), disabled: form.$invalid}" type=submit ng-disabled=form.$invalid><span class=spinner><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span> <span class=success><svg version=1.1 x=0px y=0px width=611.99px height=611.99px viewbox="0 0 611.99 611.99" enable-background="new 0 0 611.99 611.99" xml:space=preserve><path class=checkMark d="M606.453,101.171c-7.422-7.384-19.436-7.384-26.856,0L209.688,470.353L32.71,293.719c-7.499-7.46-19.626-7.46-27.086,0     c-7.499,7.46-7.499,19.588,0,27.048L195.341,510.14c0.115,0.115,0.306,0.153,0.421,0.269c0.115,0.114,0.153,0.268,0.229,0.382     c7.422,7.422,19.435,7.422,26.856,0l383.605-382.84C613.836,120.566,613.836,108.554,606.453,101.171z"></svg></span> <span class=modal-button-inner ng-show=isMaker() ng-bind=modal.button.status>Send Invite</span> <span class=modal-button-inner ng-show=!isMaker() ng-bind=modal.button.status>Subscribe</span></button></form><a class=modal-secondary-action ng-show=isMaker() href=mailto:jonas@ideahatch.co>Is this not you? Let us know.</a> <a class=modal-secondary-action ng-show=!isMaker() href=mailto:jonas@ideahatch.co>Not listed as a Maker yet? Let us know.</a></div><div class=modal ng-switch-when=error><img class=error-illo src=../assets/images/error_illo_2x.png alt="ERROR"><h2 class=modal-headline>Oh...yeah, that\'s no good.</h2><p class=modal-message>It seems like something broke on our side of things. We\'ll look into it right away!</p><button class="modal-button error"><span class=spinner><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span> <span class=success><svg version=1.1 x=0px y=0px width=611.99px height=611.99px viewbox="0 0 611.99 611.99" enable-background="new 0 0 611.99 611.99" xml:space=preserve><path class=checkMark d="M606.453,101.171c-7.422-7.384-19.436-7.384-26.856,0L209.688,470.353L32.71,293.719c-7.499-7.46-19.626-7.46-27.086,0     c-7.499,7.46-7.499,19.588,0,27.048L195.341,510.14c0.115,0.115,0.306,0.153,0.421,0.269c0.115,0.114,0.153,0.268,0.229,0.382     c7.422,7.422,19.435,7.422,26.856,0l383.605-382.84C613.836,120.566,613.836,108.554,606.453,101.171z"></svg></span> <span class=modal-button-inner>Report this to us!</span></button></div></div>'),a.put("app/main/main.html",'<div id=mainView><div class=makerFaces><img preload id={{maker.id}} class="makerFaces-face animated" ng-src={{maker.profile.image_192}} ng-repeat="maker in makers" alt=""></div><nav class=hidden><div class=container><div class=row><div class="twelve columns"><ul><li><a href=#>Contributors</a></li><li><a href=#>Contact</a></li></ul></div></div></div></nav><header><div class=container><div class=row><div class="offset-by-two eight columns"><h1 class=logo>Maker Hunt</h1><h3 class=tagline>The slack chat for driven product makers from the Product Hunt community</h3><a href=/login target=_self class=btn-requestInvite>Request Invite</a> <a href=/login target=_self class="login-with-PH hidden">Login with ProductHunt</a></div></div></div></header><section class=main><div class=container><div class=row><div class="offset-by-two eight columns"><h2 class=amas-headline>Our Maker AMA\'s</h2><h4 class=amas-tagline>From product and business to work-life balance,<br>come ask the makers anything</h4></div></div><div class=row><div class="twelve columns"><div class=switch-wrapper><button class="btn-amas btn-amas--upcoming active" data-ng-class="{&quot;active&quot;: state==&quot;upcoming&quot;}" ng-click="state = &quot;upcoming&quot;;">upcoming</button><!--\n              --><button class="btn-amas btn-amas--previous" data-ng-class="{&quot;active&quot;: state==&quot;previous&quot;}" ng-click="state = &quot;previous&quot;;">previous</button></div></div></div><div class=row><div class="offset-by-one ten columns"><div class=amaList><div class=ama-wrapper ng-repeat="event in events | filter:eventsFilter | orderBy:sortEvents:(state==\'previous\')"><div class=row><div class="six columns"><h5 class=ama--timestamp>{{event.from_date | amDateFormat:"dddd, MMMM Do YYYY @ h:mma"}}</h5></div><div class="six columns"><div class=action-menu ng-if="state===\'previous\'"><a ng-href={{event.link}} class="action-item link" ng-show="event.link!=\'\'" target=_blank><i class="fa fa-link"></i></a></div><div class=action-menu ng-if="state===\'upcoming\'"><a ng-href={{event.link}} class="action-item link" ng-show="event.link!=\'\'" target=_blank><i class="fa fa-link"></i></a> <a ng-href="https://twitter.com/intent/tweet?text=.@{{event.username}} is having an AMA on {{event.from_date | amDateFormat:\'dddd, MMMM Do YYYY @ h:mma\'}} with makerhunt.co" class="action-item twitter"><i class="fa fa-twitter"></i></a> <a target=_blank ng-href="https://www.facebook.com/dialog/share?app_id=673766526078470&display=popup&href=http://makerhunt.co&redirect_uri=http://makerhunt.co" class="action-item facebook hidden"><i class="fa fa-facebook-official"></i></a><div class=calendar-wrapper><a ng-href=# ng-click=openCalendarOptions(event); class="action-item calendar"><i class="fa fa-calendar-o"></i></a><div class=calendar-options ng-show="openCalendar === event"><ul class=calendar-options-list><li class=calendar-option-item><a ng-href="data:text/calendar;charset=utf-8,%0ABEGIN:VCALENDAR%0D%0ABEGIN:VEVENT%0AADTSTAMP:{{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ADTSTART:{{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ADTEND:{{event.till_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ASUMMARY:AMA with {{event.ph_profile.name}}%0AEND:VEVENT%0AEND:VCALENDAR" download=event.ics target=_blank>iCal</a></li><li class=calendar-option-item><a ng-href="http://www.google.com/calendar/event?action=TEMPLATE&text=AMA with {{event.ph_profile.name}}&dates={{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z/{{event.till_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z&details={{event.ph_profile.headline}}&location=Makerhunt&trp=false&sprop=&sprop=name:" target=_blank>Google Calendar</a></li></ul></div></div></div></div></div><div class=ama><div class=row><div class="twelve columns"><!--<div class="ama--pic--wrapper">--><img class="u-max-full-width ama--pic" ng-src="{{event.ph_profile.image_url[\'88px@3X\']}}" alt="@{{event.username}}"><!--</div>\n                    <div class="ama--content--wrapper">--><h2 class=ama--maker-name>{{event.ph_profile.name}} <small class=ama--maker-username><a ng-href=https://twitter.com/{{event.username}} target=_blank>@{{event.username}}</a></small></h2><p class=ama--description>{{event.description}}</p><!--</div>--><div class=maker-of--wrapper><h6 class=ama--maker-headline ng-show=event.ph_profile.maker_of.length>Maker</h6><ul class=maker-of-list><li class=maker-of-list--item ng-repeat="product in event.ph_profile.maker_of | filter: productsFilter"><a target=_blank ng-href={{product.discussion_url}}>{{product.name}}</a></li></ul></div></div></div></div></div></div></div></div></div></section></div>'),a.put("app/modals/error.html","<div class=overlay ng-click=closeModal();><div modal response=response ng-click=$event.stopPropagation();></div></div>"),a.put("app/modals/me.html","<div class=overlay ng-click=closeModal();><div modal response=response ng-click=$event.stopPropagation();></div></div>"),a.put("app/signup/signup.html",'<div id=signupView><div class=container><div class=row><div class=signup--container><div class=envelope-container><img class=envelope-background src="../assets/images/innerfold@2x.png"><div class=envelope-letter-container><img class=envelope-letter ng-class="{letterPosTwo: step===2, letterPosThree: step===3}" src="../assets/images/letter@2x.png"></div><div class=envelope-bottom-container><img class=envelope-bottom src="../assets/images/envelope@2x.png"></div></div><div id=stepOne><div class=header-container><h2 class=signup--welcomeHeader>Hey there, @{{user.username}}!</h2><h5 class=signup--welcomeText>We checked your Twitter info to ensure you\'re human! Now, just a sec while we verify your Maker status on Product Hunt.</h5></div><div class=userCard><div class=maker-img-wrapper><img class=userCard-userImg ng-src="{{user.image_url[\'88px\']}}"><div ng-if=isMaker() class="makerBadge animated bounceIn">M</div></div><p class=userCard-userBio>{{user.headline}}</p></div><div class=actions><p class=processDescription ng-if=!isMaker()>Don\'t be alarmed, it usually takes a second or two. Code stuff...</p><p class=processDescription ng-if=isMaker()>Yay! You\'re confirmed as a maker on Product Hunt!</p><button ng-if=!ph_loaded class=checkingPHstatus disabled>Checking Product Hunt...</button> <button ng-if=ph_loaded class=nextStep ng-class="{makerBtn: isMaker(), nonMakerBtn: !isMaker()}" ng-click=goToStepTwo()>Continue <i class="fa fa-arrow-right"></i></button></div></div><div id=stepTwo class=hidden><form name=form ng-submit=submit(form) novalidate><div class=header-container><h2 class=signup--welcomeHeader ng-if=isMaker()>Almost there...</h2><h2 class=signup--welcomeHeader ng-if=!isMaker()>Oh no...</h2><h5 class=signup--welcomeText ng-if=isMaker()>We use Slack as a communication tool, please let us know which E-mail address we should send the invite to.</h5><h5 class=signup--welcomeText ng-if=!isMaker()>Currently only verified Makers on Product Hunt can join Maker Hunt. If you tell us your E-mail address we will let you know once there are other ways to join!</h5></div><input class=user-email type=email name=email ng-model=user.email placeholder=your@awesome.email required> <span class=error-txt ng-show="form.email.$error.required && !form.$pristine">A valid email address is required.</span> <span class=error-txt ng-show="form.email.$error.email && !form.$pristine">Please enter a valid email address.</span><p class=processDescription ng-if=isMaker()>Click the button & check your email! :)</p><p class=processDescription ng-if=!isMaker()><a href=mailto:jonas@ideahatch.co>My product is on ProductHunt, I\'m just not marked as the Maker yet!</a></p><button ng-if=isMaker() class="finish-btn makerBtn" type=submit ng-disabled=form.$invalid><i class="fa fa-envelope-o"></i> Send Invite</button> <button ng-if=!isMaker() class="finish-btn nonMakerBtn" type=submit ng-disabled=form.$invalid><i class="fa fa-envelope-o"></i> Subscribe</button></form></div><div id=stepThree class=hidden><div class=header-container ng-if=isMaker()><h2 class=signup--welcomeHeader ng-if=hasTeamMembers()>Invite your team</h2><h2 class=signup--welcomeHeader ng-if=!hasTeamMembers()>You\'re in!</h2><h5 class=signup--welcomeText ng-if=hasTeamMembers()>The invite has been sent! It looks like you worked with some awesome people before, why not invite them, too?</h5><h5 class=signup--welcomeText ng-if=!hasTeamMembers()>The invite has been sent! We can\'t wait for you to join us!</h5></div><div class=header-container ng-if=!isMaker()><h2 class=signup--welcomeHeader>You\'re now subscribed</h2><h5 class=signup--welcomeText>Thank you for subscribing, you\'ll receive the MakerHunt newsletter from now on.</h5></div><div class=teamMembers-container ng-if=teamMembers><div class=teamMember ng-repeat="teamMember in teamMembers"><div class=image-container><img class=teamMember-pic ng-src="{{teamMember.image_url[\'32px\']}}"></div><div class=info-container><h4 class=teamMember-name>{{teamMember.name}}</h4><h6 class=teamMember-username>@{{teamMember.username}}</h6></div><a class=invite-teamMember ng-href="https://twitter.com/intent/tweet?text=@{{teamMember.username}} I recommended you on @MakerHunt. Join our awesome community of Makers:&url=http://www.makerhunt.co/&related=makerhunt"><i class="fa fa-twitter"></i> Invite @{{teamMember.username}}</a></div></div><a href="/" class=goHomeBtn><i class="fa fa-home"></i> Back To Home</a></div></div></div></div></div>'),a.put("app/timeline/timeline.html",'<div id=feedView infinite-scroll=load() infinite-scroll-distance=200><div class=fixedNav><div class=container><div class=logo-wrapper><h1 class=logo>MakerHunt</h1></div><div class=search-wrapper style="opacity: 0"><div class=search-box><input class=search placeholder="Search makers, locations and projects…" autocomplete="off"></div></div><div class=nav-action-wrapper><ul class=action-list><li class=action-item><i class="fa fa-bell"></i></li><li class=action-item><i class="fa fa-user"></i></li></ul></div></div></div><div class=fixedNav-height></div><div class="container feed-wrapper"><div class=row><div class=f_left-sidebar>{{ user.name }}</div><div class=f_main-content><form name=form ng-submit=share(form) novalidate><div class="newPost-wrapper ui_card"><div class=newPost-inner><textarea ng-model=currentPost.status name=status placeholder="Something to share?" id=status class=textarea-autogrow role=textbox required></textarea><span class=error-txt ng-show="form.status.$error.required && !form.$pristine">Common\', don\'t you have anything to share?</span></div><div class=newPost-actions><button id=newPost-submit class=newPost-postBtn type=submit ng-disabled=form.$invalid><div class=outline><div class=pulse></div></div>Post</button></div></div></form><div class="main-timeline ui_card"><div class="ui_hero main-filter"><ul class=main-filter--list><li class="main-filter--item active"><i class="fa fa-globe"></i> Global</li><li class=main-filter--item><i class="fa fa-slack"></i> Slack</li></ul></div><div class="ui_post timeline-item" ng-repeat="post in posts"><div class="ui_post-head timeline-item--meta"><div class=meta-who-did-what><img ng-src="{{post.user.image_url[\'88px\']}}" class="user-pic"><p class=who-did-what><span class=who>{{post.user.name}}</span> <span class=did>shared</span> <span class=what>a<span ng-if="post.card.type===\'article\'">n</span> {{post.card.type || \'link\'}}</span>.</p><div class="user-detail-card ui_card" style="background-image: url({{post.user.image_url[\'88px\']}})"><div class=detail-wrapper><div class=name-wrapper><h4 class=userName>{{post.user.name}}</h4></div><div class=badge-wrapper ng-repeat="badge in post.user.ph_settings.maker_of"><div class=badgeItemName><a ng-href={{badge.discussion_url}} target=_blank>{{badge.name}}</a> <span class=makerBadge>M</span></div></div></div></div></div><div class=meta-timestamp><p class=timestamp am-time-ago=post.created_at></p></div></div><div class="ui_post-body timeline-item--content"><div class=status-wrapper><div class=quote-icon-wrapper><h4 class=quote ng-switch=post.via.provider><i class="fa fa-twitter" ng-switch-when=twitter></i> <i class="fa fa-slack" ng-switch-when=slack></i> <i class="fa fa-pencil" ng-switch-when=direct></i></h4></div><div class=status-message><p class=status ng-bind-html=post.status></p></div></div><div class=external-content-wrapper ng-repeat="card in post.cards"><div class=text-wrapper><img ng-src={{card.icon}} alt="" class="sourceImg"> <a class=external-content-headline ng-bind=card.headline ng-bind-href={{card.url}} target=_blank></a><p class=external-content-snippet ng-bind-html=card.text></p></div><div class=img-wrapper><img ng-src={{card.img}} alt="" class="external-pic"></div></div></div><div class="ui_post-footer timeline-item--actions"><div class=poster-actions-wrapper><button class=action-edit ng-show=canEdit(post) ng-click=edit(post)><i class="fa fa-pencil"></i></button> <button class=action-delete ng-show=canDelete(post) ng-click=delete(post)><i class="fa fa-trash-o"></i></button></div><div class=comment-open-wrapper><button class=comment-toggle ng-click="openComments(post); $event.stopPropagation();"><i class="fa fa-comments-o"></i> Comments ({{post.comments.length}})</button></div></div><div class="ui_comments-container ui_card popup" ng-class="{\'comments-open\': isCommentsPost(post)}" ng-controller=CommentsCtrl><h4 class=comments-headline>Comments <i class="fa fa-comments-o"></i></h4><div class=comment-wrapper ng-if="post.comments.length == 0">be the first to comment</div><div class=comment-wrapper ng-repeat="comment in post.comments | orderBy:sortComments:true"><div class=img-wrapper><img ng-src="{{comment.user.image_url[\'88px\']}}" alt="" class="user-img"></div><div class=comment-meta><h5 class=user-name ng-bind=comment.user.name></h5><h6 class=user-userName>@sleinadsanoj</h6><!--<div class="timestamp" am-time-ago="comment.created_at"></div>--></div><div class=comment-actions-wrapper><button class=action-delete ng-show=canDelete(comment) ng-click=delete(comment)><i class="fa fa-trash-o"></i></button></div><div class=comment-status-wrapper><p class=comment-status ng-bind-html=comment.body></p></div></div><div class=newComment-wrapper ng-controller=CommentCtrl><form name=form ng-submit=submit(form) novalidate><input name=body ng-model=comment.body placeholder="Write something..." class="textarea-autogrow newComment" required><!--<span class="error-txt" ng-show="form.body.$error.required && !form.$pristine">Common\', don\'t you have anything to share?</span>--></form></div></div></div><div ng-switch=state><div ng-switch-when=loading><div class=loader-height></div><div class=ui_content-loader><div class=bar></div><div class=bar></div><div class=bar></div><div class=bar></div><div class=bar></div></div></div><div ng-switch-when=no-more><p class=no-more></p></div><p ng-switch-when=error>Error</p></div><!--\n          <div ng-if="loadingPosts && !noMorePosts">Loading</div>\n          <div ng-if="!loadingPosts && noMorePosts">No More Posts</div>\n          --></div></div><div id=right-sidebar class=f_right-sidebar ng-class="{\'sidebar-blur\': (commentsPost != null)}"><div class=ui_sideBar-wrapper><div class=ui_card><h4 class=ui_sideBar-headline>Upcoming Events</h4><div class=ui_sideBar-section><ul class=sideBar-list><li class=sideBar-list--item ng-repeat="event in events | filter:eventsFilter | orderBy:sortEvents"><div class=img-wrapper><img ng-src={{event.ph_profile.image_url.original}} alt="" class="event-img"></div><div class=info-wrapper><h4 class=event-info--headline><span class=eventName>AMA</span> <span class=with>with</span> <span class=eventWho>{{event.title}}</span></h4><p class=event-info--meta><span class=timestamp>in 6 days</span> · <i class="fa fa-slack"></i>MakerHunt</p></div></li></ul></div></div></div></div></div></div></div>')
}]);