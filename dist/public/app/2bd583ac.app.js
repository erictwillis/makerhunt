"use strict";function convertDateStringsToDates(a){if("object"!=typeof a)return a;for(var b in a)if(a.hasOwnProperty(b)){var c=a[b];"string"==typeof c&&moment(c).isValid()?a[b]=moment(c).toDate():"object"==typeof c&&convertDateStringsToDates(c)}}angular.module("makerhuntApp",["ng","ngCookies","ngResource","ngSanitize","angularMoment","ui.router"]).config(["$locationProvider","$httpProvider","$stateProvider","$urlRouterProvider","$compileProvider",function(a,b,c,d,e){d.otherwise("/"),e.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/),a.html5Mode(!0),b.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b){return{request:function(a){return a.headers=a.headers||{},a},responseError:function(a){return b.reject(401===a.status?a:a)}}}]).run(["$rootScope","$location","$state","Auth",function(a,b,c,d){a.$on("$stateChangeStart",function(a,b){d.isLoggedInAsync(function(a){angular.isDefined(b.roles)&&(a||c.go("main"))})})}]).run(["$window",function(a){a.navigator.userAgent.match(/OS X.*Safari/)&&!a.navigator.userAgent.match(/Chrome/)&&$("body").addClass("safari")}]),angular.module("makerhuntApp").filter("firstname",function(){return function(a){return angular.isUndefined(a)?"":a.split(" ")[0]}}),angular.module("makerhuntApp").filter("utc",function(){return function(a){return angular.isUndefined(a)?"":moment(a).utc()}});var regexIso8601=/^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;angular.module("makerhuntApp").config(["$httpProvider",function(a){a.defaults.transformResponse.push(function(a,b){return"application/json"===b()["content-type"]&&convertDateStringsToDates(a),a})}]),angular.module("makerhuntApp").controller("AdminCtrl",["$scope","$http","Event","User",function(a,b,c,d){a.events=[],c.query(function(b){a.events=b}),a.newEvent=new c({}),a.searchForUser=function(){return console.log(a.newEvent.username),a.newEvent.username?void(user=d.create({screen_name:a.newEvent.username}).$promise.then(function(b){a.newEvent.username=b.username,a.newEvent.title=b.name,a.newEvent.headline=b.twitter_profile.description,a.newEvent.ph_profile=b.ph_settings})["catch"](function(a){console.log(a),alert("error")})):!1},a.saveEvent=function(){angular.isUndefined(a.newEvent.event_id)?a.newEvent.$create().then(function(b){a.events.push(b)}):a.newEvent.$save()},a.editEvent=function(b){a.newEvent=b,a.action="Edit"},a.deleteEvent=function(b){b.$delete().then(function(){var c=a.events.indexOf(b);-1!=c&&a.events.splice(c,1)})}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",views:{main:{templateUrl:"app/admin/admin.html",controller:"AdminCtrl"}}})}]),angular.module("makerhuntApp").directive("modal",["$timeout","$interval","Me",function(a,b,c){return{templateUrl:"app/directives/modal/modal.html",restrict:"A",scope:{response:"=response"},controller:["$scope",function(a){a.isMaker=function(){return a.response.user.$resolved?a.response.user.ph_settings.maker_of_count>0:!1}}],link:function(a){a.modal={},a.response.user.$promise.then(function(){a.email=a.response.user.email,a.modal.button.status=a.isMaker()?"Send Invite":"Subscribe"}),a.modal.button={status:""},a.state="normal",a.submit=function(){a.modalEvaluated===!0,a.modalEvaluated=!0,a.target=$("#modal-submit-btn");var d=null;if($(a.target).addClass("busy"),a.$on("$destroy",function(){null===d&&($(a.target).removeClass("busy"),b.cancel(d))}),a.isMaker()){var e=0;d=b(function(){var b=["Fetching envelope...","Sending..."];a.modal.button.status=b[e],e<b.length-1&&e++},600),c.invite({email:a.email}).$promise.then(function(){a.modal.button.status="Invite sent!",$(a.target).addClass("done")})["catch"](function(){a.modal.button.status="Error sending invite!"})["finally"](function(){b.cancel(d)})}else{var e=0;d=b(function(){var b=["Contacting servers..","Filling out application...","Checking lists..."];a.modal.button.status=b[e],e<b.length&&e++},200),c.subscribe({email:a.email}).$promise.then(function(){a.modal.button.status="Success!",$(a.target).addClass("done")})["catch"](function(){a.modal.button.status="Error!"})["finally"](function(){b.cancel(d)})}}}}}]),angular.module("makerhuntApp").directive("preload",function(){return{restrict:"A",scope:!1,priority:0,link:function(a,b){b.on("load",function(){b.addClass("fadeIn")})}}}),angular.module("makerhuntApp").controller("MeCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker","user",function(a,b,c,d,e,f,g,h,i){a.response={status:"success",user:i},$("body").addClass("open-overlay"),a.closeModal=function(){$("body").removeClass("open-overlay")}}]),angular.module("makerhuntApp").controller("ErrorCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker",function(a,b,c,d,e,f){a.response={status:"error",user:f.getCurrentUser()},$("body").addClass("open-overlay"),a.closeModal=function(){$("body").removeClass("open-overlay")}}]),angular.module("makerhuntApp").controller("MainCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker",function(a,b,c,d,e,f,g,h){a.currentUser=f.getCurrentUser(),a.state="upcoming",a.events=[],g.query(function(b){angular.forEach(b,function(b){b=angular.extend(b,{till_date:moment(b.from_date).add(1,"hour")}),a.events.push(b)})}),a.makers=[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],e(function(){h.query(function(b){var d=c.shuffle(b),e=d.slice(0,60);a.makers=e,a.makerPool=d.slice(60)},function(a){console.log(a)}),d(function(){c.switchUser(a.makers,a.makerPool)},5e3)},0),a.eventsFilter=function(b){return"upcoming"==a.state?moment(b.from_date).isAfter(moment()):"previous"==a.state?moment(b.from_date).isBefore(moment()):!1},a.openCalendarOptions=function(b){return a.openCalendar===b?(a.openCalendar=!1,!1):(a.openCalendar=!1,void(a.openCalendar=b))}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("main",{url:"/",views:{main:{templateUrl:"app/main/main.html",controller:"MainCtrl"}}}).state("main:me",{url:"/me",roles:["user","maker"],views:{main:{templateUrl:"app/main/main.html",controller:"MainCtrl"},modal:{templateUrl:"app/modals/me.html",controller:"MeCtrl",resolve:{user:["Auth",function(a){return a.getCurrentUser()}]}}}}).state("main:error",{url:"/error",views:{main:{templateUrl:"app/main/main.html",controller:"MainCtrl"},modal:{templateUrl:"app/modals/error.html",controller:"ErrorCtrl"}}})}]),angular.module("makerhuntApp").factory("Auth",["$location","$rootScope","$http","Me","$cookies","$q",function(a,b,c,d,e,f){var g={};return angular.isDefined(e.token),g=d.get(),{login:function(a,b){var d=b||angular.noop,h=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=User.get(),h.resolve(a),d()}).error(function(a){return this.logout(),h.reject(a),d(a)}.bind(this)),h.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return User.save(a,function(b){return e.put("token",b.token),g=User.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var d=c||angular.noop;return User.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return d(a)},function(a){return d(a)}).$promise},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("makerhuntApp").factory("Event",["$resource",function(a){return a("/api/v1/events",{event_id:"@event_id"},{query:{method:"GET",isArray:!0,url:"/api/v1/events"},create:{method:"POST",url:"/api/v1/events"},"delete":{method:"DELETE",url:"/api/v1/events/:event_id"},save:{method:"PUT",url:"/api/v1/events/:event_id"},get:{method:"GET",params:{id:""},url:"/api/v1/events/{id}"}})}]),angular.module("makerhuntApp").factory("Maker",["$resource",function(a){return a("/api/v1/makers",{},{query:{method:"GET",isArray:!0},get:{method:"GET"}})}]),angular.module("makerhuntApp").factory("Me",["$resource",function(a){return a("/api/v1/me",{},{get:{method:"GET",url:"/api/v1/me"},subscribe:{method:"POST",params:{},url:"/api/v1/me/subscribe"},invite:{method:"POST",params:{},url:"/api/v1/me/invite"}})}]),angular.module("makerhuntApp").factory("User",["$resource",function(a){return a("/api/v1/users",{},{create:{method:"POST"}})}]),angular.module("makerhuntApp").service("utilities",["$timeout",function(a){return{shuffle:function(a){var b,c,d=a.length;if(d)for(;--d;)c=Math.floor(Math.random()*(d+1)),b=a[c],a[c]=a[d],a[d]=b;return a},switchUser:function(b,c){if(!b.length||!c.length)return!1;var d,e,f,g;f=Math.floor(Math.random()*b.length),g=Math.floor(Math.random()*c.length),d=b[f],e=c[g],$("#"+d.id).addClass("fadeOut"),a(function(){b[f]=e,c[g]=d},1e3)}}}]),angular.module("makerhuntApp").controller("NavbarCtrl",["$scope","$location",function(a,b){a.menu=[{title:"Home",link:"/"}],a.isCollapsed=!0,a.isActive=function(a){return a===b.path()}}]),angular.module("makerhuntApp").run(["$templateCache",function(a){a.put("app/admin/admin.html",'<div id=adminView><div class=container><div class=row><div class="offset-by-one ten columns"><h2 class=admin-headline>MakerHunt Admin Interface</h2><h4>{{action}} AMA</h4><form><div class=row><div class="six columns"><label for=username>Username</label><input class=u-full-width placeholder="username (no @)" id=username ng-model=newEvent.username></div><div class="six columns"><input class="button-default btn-search" type=submit value="Search for User" ng-click=searchForUser();></div><div class="twelve columns"><label for=full-name>Full Name (pre-filled on search)</label><input class=u-full-width placeholder="Full Name" id=full-name ng-model=newEvent.title></div><div class="twelve columns"><label for=event-date>AMA Date (local time)</label><input class="u-full-width input--event-date" type=datetime-local placeholder="username (no @)" id=event-date ng-model=newEvent.from_date> {{ newEvent }}</div></div><label for=description>Description</label><textarea class=u-full-width placeholder="will be pre-filled from twitter bio, but can be changed..." id=description ng-model=newEvent.description></textarea><input class=button-primary type=submit value=Save ng-click=saveEvent();></form></div><!-- AMA LIST START --><div class=amaList><div class=ama-wrapper ng-repeat="ama in events"><div class=row><div class="six columns"><h5 class=ama--timestamp>{{ ama.from_date }}</h5></div><div class="six columns"><button class=btn-default ng-click=editEvent(ama);>Edit</button> <button class=btn-warning ng-click=deleteEvent(ama);>Delete</button></div></div><div class=ama><div class=row><div class="twelve columns"><!--<div class="ama--pic--wrapper">--><img class="u-max-full-width ama--pic" ng-src="{{ama.ph_profile.image_url[\'88px@3X\']}}" alt="@{{ama.username}}"><!--</div>\n                <div class="ama--content--wrapper">--><h2 class=ama--maker-name>{{ama.title}} <small class=ama--maker-username><a ng-href=https://twitter.com/{{ama.username}} target=_blank>@{{ama.username}}</a></small></h2><p class=ama--description>{{ama.description}}</p><!--</div>--><div class=maker-of--wrapper><h6 class=ama--maker-headline ng-show=ama.ph_profile.maker_of.length>Maker</h6><ul class=maker-of-list><li class=maker-of-list--item ng-repeat="product in ama.ph_profile.maker_of"><a ng-href={{product.discussion_url}}>{{product.name}}</a></li></ul></div></div></div></div></div></div><!-- AMA LIST END --></div></div></div>'),a.put("app/directives/modal/modal.html",'<div ng-switch=response.status><div class=modal ng-switch-when=success><form name=form ng-submit=submit() novalidate><div class=modal-img--wrapper><img class=modal-user--pic ng-src="{{response.user.image_url[\'88px@3X\']}}" alt="{{response.user.username}}"><div class=modal-makerBadge ng-show=isMaker()>M</div></div><h2 class=modal-headline>Hey {{response.user.name | firstname}},</h2><p class=modal-message ng-show=isMaker()>If the email adress below is correct, click to request your invite. If not, click to change it.</p><p class=modal-message ng-show=!isMaker()>It seems like you don\'t have a product on ProductHunt yet. You can still sign up for our newsletter below.</p><input class=modal-input type=email name=email ng-model=email required> <span class=error-txt ng-show=form.email.$error.required>Please enter a valid email address.</span> <span class=error-txt ng-show=form.email.$error.email>Please enter a valid email address.</span> <button id=modal-submit-btn class=modal-button ng-class="{subscribe : !isMaker(), disabled: form.$invalid}" type=submit ng-disabled=form.$invalid><span class=spinner><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span> <span class=success><svg version=1.1 x=0px y=0px width=611.99px height=611.99px viewbox="0 0 611.99 611.99" enable-background="new 0 0 611.99 611.99" xml:space=preserve><path class=checkMark d="M606.453,101.171c-7.422-7.384-19.436-7.384-26.856,0L209.688,470.353L32.71,293.719c-7.499-7.46-19.626-7.46-27.086,0     c-7.499,7.46-7.499,19.588,0,27.048L195.341,510.14c0.115,0.115,0.306,0.153,0.421,0.269c0.115,0.114,0.153,0.268,0.229,0.382     c7.422,7.422,19.435,7.422,26.856,0l383.605-382.84C613.836,120.566,613.836,108.554,606.453,101.171z"></svg></span> <span class=modal-button-inner ng-show=isMaker() ng-bind=modal.button.status>Send Invite</span> <span class=modal-button-inner ng-show=!isMaker() ng-bind=modal.button.status>Subscribe</span></button></form><a class=modal-secondary-action ng-show=isMaker() href=#>Is this not you? Let us know.</a> <a class=modal-secondary-action ng-show=!isMaker() href=#>Not listed as a Maker yet? Let us know.</a></div><div class=modal ng-switch-when=error><img class=error-illo src=../assets/images/Error_illustration.svg alt="ERROR"><h2 class=modal-headline>Oh...yeah, that\'s no good.</h2><p class=modal-message>It seems like something broke on our side of things. We\'ll look into it right away!</p><button class="modal-button error" ng-click=evaluateModal($event);><span class=spinner><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span> <span class=success><svg version=1.1 x=0px y=0px width=611.99px height=611.99px viewbox="0 0 611.99 611.99" enable-background="new 0 0 611.99 611.99" xml:space=preserve><path class=checkMark d="M606.453,101.171c-7.422-7.384-19.436-7.384-26.856,0L209.688,470.353L32.71,293.719c-7.499-7.46-19.626-7.46-27.086,0     c-7.499,7.46-7.499,19.588,0,27.048L195.341,510.14c0.115,0.115,0.306,0.153,0.421,0.269c0.115,0.114,0.153,0.268,0.229,0.382     c7.422,7.422,19.435,7.422,26.856,0l383.605-382.84C613.836,120.566,613.836,108.554,606.453,101.171z"></svg></span> <span class=modal-button-inner>Report this to us!</span></button></div></div>'),a.put("app/main/main.html",'<div id=mainView><div class=makerFaces><img preload id={{maker.id}} class="makerFaces-face animated" ng-src={{maker.profile.image_192}} ng-repeat="maker in makers" alt=""></div><nav><div class=container><div class=row><div class="twelve columns"><ul><li><a href=#>Contributors</a></li><li><a href=#>Contact</a></li></ul></div></div></div></nav><header><div class=container><div class=row><div class="offset-by-two eight columns"><h1 class=logo>Maker Hunt</h1><h3 class=tagline>The slack chat for product driven makers from the Product Hunt community</h3><a href=/login target=_self class=btn-requestInvite>Request Invite</a> <a href=/login target=_self class=login-with-PH>Login with ProductHunt</a></div></div></div></header><section class=main><div class=container><div class=row><div class="offset-by-two eight columns"><h2 class=amas-headline>Our Maker AMA\'s</h2><h4 class=amas-tagline>From product and business to work-life balance,<br>come ask the makers anything</h4></div></div><div class=row><div class="twelve columns"><div class=switch-wrapper><button class="btn-amas btn-amas--upcoming active" data-ng-class="{&quot;active&quot;: state==&quot;upcoming&quot;}" ng-click="state = &quot;upcoming&quot;;">upcoming</button><!--\n              --><button class="btn-amas btn-amas--previous" data-ng-class="{&quot;active&quot;: state==&quot;previous&quot;}" ng-click="state = &quot;previous&quot;;">previous</button></div></div></div><div class=row><div class="offset-by-one ten columns"><div class=amaList><div class=ama-wrapper ng-repeat="event in events | filter:eventsFilter"><div class=row><div class="six columns"><h5 class=ama--timestamp>{{event.from_date | amDateFormat:"dddd, MMMM Do YYYY @ h:mma"}}</h5></div><div class="six columns"><div class=action-menu ng-if="state===\'upcoming\'"><a ng-href="https://twitter.com/intent/tweet?text=.@{{event.username}} is having an AMA on {{event.from_date | amDateFormat:\'dddd, MMMM Do YYYY @ h:mma\'}} with makerhunt.co" class="action-item twitter"><i class="fa fa-twitter"></i></a> <a target=_blank ng-href="https://www.facebook.com/dialog/share?app_id=673766526078470&display=popup&href=http://makerhunt.co&redirect_uri=http://makerhunt.co" class="action-item facebook"><i class="fa fa-facebook-official"></i></a><div class=calendar-wrapper><a ng-href=# ng-click=openCalendarOptions(event); class="action-item calendar"><i class="fa fa-calendar-o"></i></a><div class=calendar-options ng-show="openCalendar === event"><ul class=calendar-options-list><li class=calendar-option-item><a ng-href="data:text/calendar;charset=utf-8,%0ABEGIN:VCALENDAR%0D%0ABEGIN:VEVENT%0AADTSTAMP:{{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ADTSTART:{{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ADTEND:{{event.till_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ASUMMARY:AMA with {{event.ph_profile.name}}%0AEND:VEVENT%0AEND:VCALENDAR" download=event.ics target=_blank>iCal</a></li><li class=calendar-option-item><a ng-href="http://www.google.com/calendar/event?action=TEMPLATE&text=AMA with {{event.ph_profile.name}}&dates={{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z/{{event.till_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z&details={{event.ph_profile.headline}}&location=Makerhunt&trp=false&sprop=&sprop=name:" target=_blank>Google Calendar</a></li></ul></div></div></div></div></div><div class=ama><div class=row><div class="twelve columns"><!--<div class="ama--pic--wrapper">--><img class="u-max-full-width ama--pic" ng-src="{{event.ph_profile.image_url[\'88px@3X\']}}" alt="@{{event.username}}"><!--</div>\n                    <div class="ama--content--wrapper">--><h2 class=ama--maker-name>{{event.ph_profile.name}} <small class=ama--maker-username><a ng-href=https://twitter.com/{{event.username}} target=_blank>@{{event.username}}</a></small></h2><p class=ama--description>{{event.description}}</p><!--</div>--><div class=maker-of--wrapper><h6 class=ama--maker-headline ng-show=event.ph_profile.maker_of.length>Maker</h6><ul class=maker-of-list><li class=maker-of-list--item ng-repeat="product in event.ph_profile.maker_of"><a ng-href={{product.discussion_url}}>{{product.name}}</a></li></ul></div></div></div></div></div></div></div></div></div></section></div>'),a.put("app/modals/error.html","<div class=overlay ng-click=closeModal();><div modal response=response ng-click=$event.stopPropagation();></div></div>"),a.put("app/modals/me.html","<div class=overlay ng-click=closeModal();><div modal response=response ng-click=$event.stopPropagation();></div></div>"),a.put("components/navbar/navbar.html",'<div class="navbar navbar-default navbar-static-top" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click="isCollapsed = !isCollapsed"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href="/" class=navbar-brand>makerhunt</a></div><div collapse=isCollapsed class="navbar-collapse collapse" id=navbar-main><ul class="nav navbar-nav"><li ng-repeat="item in menu" ng-class="{active: isActive(item.link)}"><a ng-href={{item.link}}>{{item.title}}</a></li></ul></div></div></div>')}]);