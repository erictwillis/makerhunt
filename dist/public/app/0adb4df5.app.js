"use strict";function convertDateStringsToDates(a){if("object"!=typeof a)return a;for(var b in a)if(a.hasOwnProperty(b)){var c,d=a[b];"string"==typeof d&&(c=d.match(/\d{4}\-\d{2}\-\d{2}T\d{2}\:\d{2}\:\d{2}(\.\d{3})?[+-]\d{2}\:\d{2}/))?a[b]=moment(d).toDate():"object"==typeof d&&convertDateStringsToDates(d)}}angular.module("makerhuntApp",["ng","ngCookies","ngResource","ngSanitize","angularMoment","ui.router"]).config(["$locationProvider","$httpProvider","$stateProvider","$urlRouterProvider","$compileProvider",function(a,b,c,d,e){d.otherwise("/"),e.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/),a.html5Mode(!0),b.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b){return{request:function(a){return a.headers=a.headers||{},a},responseError:function(a){return b.reject(401===a.status?a:a)}}}]).run(["$rootScope","$location","$state","Auth",function(a,b,c,d){a.$on("$stateChangeStart",function(a,b){d.isLoggedInAsync(function(a){angular.isDefined(b.roles)&&(a||c.go("main"))})})}]).run(["$window",function(a){a.navigator.userAgent.match(/OS X.*Safari/)&&!a.navigator.userAgent.match(/Chrome/)&&$("body").addClass("safari")}]),angular.module("makerhuntApp").filter("firstname",function(){return function(a){return angular.isUndefined(a)?"":a.split(" ")[0]}}),angular.module("makerhuntApp").filter("utc",function(){return function(a){return angular.isUndefined(a)?"":moment(a).utc()}});var regexIso8601=/^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;angular.module("makerhuntApp").config(["$httpProvider",function(a){a.defaults.transformResponse.push(function(a,b){return"application/json"===b()["content-type"]&&convertDateStringsToDates(a),a})}]),angular.module("makerhuntApp").controller("AdminCtrl",["$scope","$http","Event","User",function(a,b,c,d){a.events=[],c.query(function(b){a.events=b}),a.newEvent=new c({}),a.searchForUser=function(){if(console.log(a.newEvent.username),!a.newEvent.username)return!1;d.create({screen_name:a.newEvent.username}).$promise.then(function(b){a.newEvent.username=b.username,a.newEvent.title=b.name,a.newEvent.description=b.twitter_profile.description,a.newEvent.ph_profile=b.ph_settings})["catch"](function(a){console.log(a),alert("error")})},a.saveEvent=function(){angular.isUndefined(a.newEvent.event_id)?a.newEvent.$create().then(function(b){a.events.push(b)}):a.newEvent.$save()},a.editEvent=function(b){a.newEvent=b,a.action="Edit"},a.deleteEvent=function(b){b.$delete().then(function(){var c=a.events.indexOf(b);-1!=c&&a.events.splice(c,1)})}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",roles:["admin"],views:{main:{templateUrl:"app/admin/admin.html",controller:"AdminCtrl"}}})}]),angular.module("makerhuntApp").directive("modal",["$timeout","$interval","Me",function(a,b,c){return{templateUrl:"app/directives/modal/modal.html",restrict:"A",scope:{response:"=response"},controller:["$scope",function(a){a.isMaker=function(){return a.response.user.$resolved?a.response.user.ph_settings.maker_of_count>0:!1}}],link:function(a){a.modal={},a.response.user.$promise.then(function(){a.email=a.response.user.email,a.modal.button.status=a.isMaker()?"Send Invite":"Subscribe"}),a.modal.button={status:""},a.state="normal",a.submit=function(){a.modalEvaluated===!0,a.modalEvaluated=!0,a.target=$("#modal-submit-btn");var d=null;if($(a.target).addClass("busy"),a.$on("$destroy",function(){null===d&&($(a.target).removeClass("busy"),b.cancel(d))}),a.isMaker()){var e=0;d=b(function(){var b=["Fetching envelope...","Sending..."];a.modal.button.status=b[e],e<b.length-1&&e++},1e3),c.invite({email:a.response.user.email}).$promise.then(function(){a.modal.button.status="Invite sent!",$(a.target).removeClass("busy"),$(a.target).addClass("done")})["catch"](function(){a.modal.button.status="Error sending invite!"})["finally"](function(){b.cancel(d)})}else{var e=0;d=b(function(){var b=["Contacting servers..","Filling out application...","Checking lists..."];a.modal.button.status=b[e],e<b.length&&e++},200),c.subscribe({email:a.response.user.email}).$promise.then(function(){a.modal.button.status="Success!",$(a.target).removeClass("busy"),$(a.target).addClass("done")})["catch"](function(){a.modal.button.status="Error!"})["finally"](function(){b.cancel(d)})}}}}}]),angular.module("makerhuntApp").directive("preload",function(){return{restrict:"A",scope:!1,priority:0,link:function(a,b){b.on("load",function(){b.addClass("fadeIn")})}}}),angular.module("makerhuntApp").controller("MeCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker","user",function(a,b,c,d,e,f,g,h,i){a.response={status:"success",user:i},$("body").addClass("open-overlay"),a.closeModal=function(){$("body").removeClass("open-overlay")}}]),angular.module("makerhuntApp").controller("ErrorCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker",function(a,b,c,d,e,f){a.response={status:"error",user:f.getCurrentUser()},$("body").addClass("open-overlay"),a.closeModal=function(){$("body").removeClass("open-overlay")}}]),angular.module("makerhuntApp").controller("MainCtrl",["$scope","$http","utilities","$interval","$timeout","Auth","Event","Maker",function(a,b,c,d,e,f,g,h){a.currentUser=f.getCurrentUser(),a.state="upcoming",a.events=[],g.query(function(b){angular.forEach(b,function(b){b=angular.extend(b,{till_date:moment(b.from_date).add(1,"hour")}),a.events.push(b)})}),a.makers=[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],e(function(){h.query(function(b){var d=c.shuffle(b),e=d.slice(0,60);a.makers=e,a.makerPool=d.slice(60)},function(a){console.log(a)}),d(function(){c.switchUser(a.makers,a.makerPool)},5e3)},0),a.productsFilter=function(a){return"http://www.producthunt.com/posts/intercom-3"===a.discussion_url?!1:!0},a.eventsFilter=function(b){return"upcoming"==a.state?moment(b.from_date).isAfter(moment()):"previous"==a.state?moment(b.from_date).isBefore(moment()):!1},a.sortEvents=function(a){return a.from_date},a.openCalendarOptions=function(b){return a.openCalendar===b?(a.openCalendar=!1,!1):(a.openCalendar=!1,void(a.openCalendar=b))}}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("main",{url:"/",views:{main:{templateUrl:"app/main/main.html",controller:"MainCtrl"}}})}]),angular.module("makerhuntApp").factory("Auth",["$location","$rootScope","$http","Me","$cookies","$q",function(a,b,c,d,e,f){var g=d.get();return{login:function(a,b){var d=b||angular.noop,h=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=User.get(),h.resolve(a),d()}).error(function(a){return this.logout(),h.reject(a),d(a)}.bind(this)),h.promise},logout:function(){e.remove("token"),g={}},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return-1!=["sleinadsanoj","erictwillis","remco_verhoef"].indexOf(g.username)}}}]),angular.module("makerhuntApp").factory("Event",["$resource",function(a){return a("/api/v1/events",{event_id:"@event_id"},{query:{method:"GET",isArray:!0,url:"/api/v1/events"},create:{method:"POST",url:"/api/v1/events"},"delete":{method:"DELETE",url:"/api/v1/events/:event_id"},save:{method:"PUT",url:"/api/v1/events/:event_id"},get:{method:"GET",params:{id:""},url:"/api/v1/events/{id}"}})}]),angular.module("makerhuntApp").factory("Maker",["$resource",function(a){return a("/api/v1/makers",{},{query:{method:"GET",isArray:!0},get:{method:"GET"}})}]),angular.module("makerhuntApp").factory("Me",["$resource",function(a){return a("/api/v1/me",{},{get:{method:"GET",url:"/api/v1/me"},subscribe:{method:"POST",params:{},url:"/api/v1/me/subscribe"},updateProductHuntData:{method:"POST",params:{},url:"/api/v1/me/update-producthunt-data"},invite:{method:"POST",params:{},url:"/api/v1/me/invite"}})}]),angular.module("makerhuntApp").factory("User",["$resource",function(a){return a("/api/v1/users",{},{create:{method:"POST"}})}]),angular.module("makerhuntApp").service("utilities",["$timeout",function(a){return{shuffle:function(a){var b,c,d=a.length;if(d)for(;--d;)c=Math.floor(Math.random()*(d+1)),b=a[c],a[c]=a[d],a[d]=b;return a},switchUser:function(b,c){if(!b.length||!c.length)return!1;var d,e,f,g;f=Math.floor(Math.random()*b.length),g=Math.floor(Math.random()*c.length),d=b[f],e=c[g],$("#"+d.id).addClass("fadeOut"),a(function(){b[f]=e,c[g]=d},1e3)}}}]),angular.module("makerhuntApp").controller("SignupCtrl",["$scope","user","$timeout","Me",function(a,b,c,d){a.user=b,a.step=1,a.ph_loaded=!1,d.updateProductHuntData().$promise.then(function(b){a.user=b,angular.forEach(a.user.ph_settings.maker_of,function(b){angular.forEach(b.makers,function(b){a.teamMembers.push(b)})}),a.ph_loaded=!0}),a.isMaker=function(){return a.user.$resolved&&a.user.ph_settings?a.user.ph_settings.maker_of.length>0:!1},a.submit=function(b){if(!b.$invalid){var c=d.subscribe({email:a.user.email}).$promise;a.isMaker()&&(c=d.invite({email:a.user.email}).$promise),c.then(function(){a.goToStepThree()})["catch"](function(){scope.modal.button.status="Error sending invite!"})["finally"](function(){})}},a.goToStepTwo=function(){$("#stepOne").addClass("animated bounceOutLeft"),a.step=2,c(function(){$("#stepOne").addClass("hidden"),$("#stepTwo").removeClass("hidden"),$("#stepTwo").addClass("animated bounceInRight")},1e3)},a.goToStepThree=function(){$("#stepTwo").addClass("bounceOutLeft"),c(function(){a.step=3,$("#stepTwo").addClass("hidden"),$("#stepThree").removeClass("hidden"),$("#stepThree").addClass("animated bounceInRight")},1e3)},a.teamMembers=[]}]),angular.module("makerhuntApp").config(["$stateProvider",function(a){a.state("signup",{url:"/signup",views:{main:{templateUrl:"app/signup/signup.html",controller:"SignupCtrl",resolve:{user:["Auth",function(a){return a.getCurrentUser().$promise}]}}}})}]),angular.module("makerhuntApp").run(["$templateCache",function(a){a.put("app/admin/admin.html",'<div id=adminView><div class=container><div class=row><div class="offset-by-one ten columns"><h2 class=admin-headline>MakerHunt Admin Interface</h2><h4>{{action}} AMA</h4><form><div class=row><div class="six columns"><label for=username>Username</label><input class=u-full-width placeholder="username (no @)" id=username ng-model=newEvent.username></div><div class="six columns"><input class="button-default btn-search" type=submit value="Search for User" ng-click=searchForUser();></div><div class="twelve columns"><label for=full-name>Full Name (pre-filled on search)</label><input class=u-full-width placeholder="Full Name" id=full-name ng-model=newEvent.title></div><div class="twelve columns"><label for=event-date>AMA Date (local time)</label><input class="u-full-width input--event-date" type=datetime-local placeholder="username (no @)" id=event-date ng-model=newEvent.from_date></div></div><div class="twelve columns"><label for=link>Link</label><input class=u-full-width placeholder=Link id=link ng-model=newEvent.link></div><label for=description>Description</label><textarea class=u-full-width placeholder="will be pre-filled from twitter bio, but can be changed..." id=description ng-model=newEvent.description></textarea><input class=button-primary type=submit value=Save ng-click=saveEvent();></form></div><!-- AMA LIST START --><div class=amaList><div class=ama-wrapper ng-repeat="ama in events"><div class=row><div class="six columns"><h5 class=ama--timestamp>{{ ama.from_date }}</h5></div><div class="six columns"><button class=btn-default ng-click=editEvent(ama);>Edit</button> <button class=btn-warning ng-click=deleteEvent(ama);>Delete</button></div></div><div class=ama><div class=row><div class="twelve columns"><!--<div class="ama--pic--wrapper">--><img class="u-max-full-width ama--pic" ng-src="{{ama.ph_profile.image_url[\'88px@3X\']}}" alt="@{{ama.username}}"><!--</div>\n                <div class="ama--content--wrapper">--><h2 class=ama--maker-name>{{ama.title}} <small class=ama--maker-username><a ng-href=https://twitter.com/{{ama.username}} target=_blank>@{{ama.username}}</a></small></h2><p class=ama--description>{{ama.description}}</p><!--</div>--><div class=maker-of--wrapper><h6 class=ama--maker-headline ng-show=ama.ph_profile.maker_of.length>Maker</h6><ul class=maker-of-list><li class=maker-of-list--item ng-repeat="product in ama.ph_profile.maker_of"><a ng-href={{product.discussion_url}}>{{product.name}}</a></li></ul></div></div></div></div></div></div><!-- AMA LIST END --></div></div></div>'),a.put("app/directives/modal/modal.html",'<div ng-switch=response.status><div class=modal ng-switch-when=success><form name=form ng-submit=submit(form) novalidate><div class=modal-img--wrapper><img class=modal-user--pic ng-src="{{response.user.image_url[\'88px@3X\']}}" alt="{{response.user.username}}"><div class=modal-makerBadge ng-show=isMaker()>M</div></div><h2 class=modal-headline>Hey {{response.user.name | firstname}},</h2><p class=modal-message ng-show=isMaker()>If the email adress below is correct, click to request your invite. If not, click the box to easily change it.</p><p class=modal-message ng-show=!isMaker()>It seems like you don\'t have a product on ProductHunt yet. You can still sign up for our newsletter below.</p><input class=modal-input type=email name=email ng-model=response.user.email required> <span class=error-txt ng-show=form.email.$error.required>Please enter a valid email address.</span> <span class=error-txt ng-show=form.email.$error.email>Please enter a valid email address.</span> <button id=modal-submit-btn class=modal-button ng-class="{subscribe : !isMaker(), disabled: form.$invalid}" type=submit ng-disabled=form.$invalid><span class=spinner><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span> <span class=success><svg version=1.1 x=0px y=0px width=611.99px height=611.99px viewbox="0 0 611.99 611.99" enable-background="new 0 0 611.99 611.99" xml:space=preserve><path class=checkMark d="M606.453,101.171c-7.422-7.384-19.436-7.384-26.856,0L209.688,470.353L32.71,293.719c-7.499-7.46-19.626-7.46-27.086,0     c-7.499,7.46-7.499,19.588,0,27.048L195.341,510.14c0.115,0.115,0.306,0.153,0.421,0.269c0.115,0.114,0.153,0.268,0.229,0.382     c7.422,7.422,19.435,7.422,26.856,0l383.605-382.84C613.836,120.566,613.836,108.554,606.453,101.171z"></svg></span> <span class=modal-button-inner ng-show=isMaker() ng-bind=modal.button.status>Send Invite</span> <span class=modal-button-inner ng-show=!isMaker() ng-bind=modal.button.status>Subscribe</span></button></form><a class=modal-secondary-action ng-show=isMaker() href=mailto:jonas@ideahatch.co>Is this not you? Let us know.</a> <a class=modal-secondary-action ng-show=!isMaker() href=mailto:jonas@ideahatch.co>Not listed as a Maker yet? Let us know.</a></div><div class=modal ng-switch-when=error><img class=error-illo src=../assets/images/error_illo_2x.png alt="ERROR"><h2 class=modal-headline>Oh...yeah, that\'s no good.</h2><p class=modal-message>It seems like something broke on our side of things. We\'ll look into it right away!</p><button class="modal-button error"><span class=spinner><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span> <span class=success><svg version=1.1 x=0px y=0px width=611.99px height=611.99px viewbox="0 0 611.99 611.99" enable-background="new 0 0 611.99 611.99" xml:space=preserve><path class=checkMark d="M606.453,101.171c-7.422-7.384-19.436-7.384-26.856,0L209.688,470.353L32.71,293.719c-7.499-7.46-19.626-7.46-27.086,0     c-7.499,7.46-7.499,19.588,0,27.048L195.341,510.14c0.115,0.115,0.306,0.153,0.421,0.269c0.115,0.114,0.153,0.268,0.229,0.382     c7.422,7.422,19.435,7.422,26.856,0l383.605-382.84C613.836,120.566,613.836,108.554,606.453,101.171z"></svg></span> <span class=modal-button-inner>Report this to us!</span></button></div></div>'),a.put("app/main/main.html",'<div id=mainView><div class=makerFaces><img preload id={{maker.id}} class="makerFaces-face animated" ng-src={{maker.profile.image_192}} ng-repeat="maker in makers" alt=""></div><nav class=hidden><div class=container><div class=row><div class="twelve columns"><ul><li><a href=#>Contributors</a></li><li><a href=#>Contact</a></li></ul></div></div></div></nav><header><div class=container><div class=row><div class="offset-by-two eight columns"><h1 class=logo>Maker Hunt</h1><h3 class=tagline>The slack chat for driven product makers from the Product Hunt community</h3><a href=/login target=_self class=btn-requestInvite>Request Invite</a> <a href=/login target=_self class="login-with-PH hidden">Login with ProductHunt</a></div></div></div></header><section class=main><div class=container><div class=row><div class="offset-by-two eight columns"><h2 class=amas-headline>Our Maker AMA\'s</h2><h4 class=amas-tagline>From product and business to work-life balance,<br>come ask the makers anything</h4></div></div><div class=row><div class="twelve columns"><div class=switch-wrapper><button class="btn-amas btn-amas--upcoming active" data-ng-class="{&quot;active&quot;: state==&quot;upcoming&quot;}" ng-click="state = &quot;upcoming&quot;;">upcoming</button><!--\n              --><button class="btn-amas btn-amas--previous" data-ng-class="{&quot;active&quot;: state==&quot;previous&quot;}" ng-click="state = &quot;previous&quot;;">previous</button></div></div></div><div class=row><div class="offset-by-one ten columns"><div class=amaList><div class=ama-wrapper ng-repeat="event in events | filter:eventsFilter | orderBy:sortEvents:(state==\'previous\')"><div class=row><div class="six columns"><h5 class=ama--timestamp>{{event.from_date | amDateFormat:"dddd, MMMM Do YYYY @ h:mma"}}</h5></div><div class="six columns"><div class=action-menu ng-if="state===\'previous\'"><a ng-href={{event.link}} class="action-item link" ng-show="event.link!=\'\'" target=_blank><i class="fa fa-link"></i></a></div><div class=action-menu ng-if="state===\'upcoming\'"><a ng-href={{event.link}} class="action-item link" ng-show="event.link!=\'\'" target=_blank><i class="fa fa-link"></i></a> <a ng-href="https://twitter.com/intent/tweet?text=.@{{event.username}} is having an AMA on {{event.from_date | amDateFormat:\'dddd, MMMM Do YYYY @ h:mma\'}} with makerhunt.co" class="action-item twitter"><i class="fa fa-twitter"></i></a> <a target=_blank ng-href="https://www.facebook.com/dialog/share?app_id=673766526078470&display=popup&href=http://makerhunt.co&redirect_uri=http://makerhunt.co" class="action-item facebook hidden"><i class="fa fa-facebook-official"></i></a><div class=calendar-wrapper><a ng-href=# ng-click=openCalendarOptions(event); class="action-item calendar"><i class="fa fa-calendar-o"></i></a><div class=calendar-options ng-show="openCalendar === event"><ul class=calendar-options-list><li class=calendar-option-item><a ng-href="data:text/calendar;charset=utf-8,%0ABEGIN:VCALENDAR%0D%0ABEGIN:VEVENT%0AADTSTAMP:{{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ADTSTART:{{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ADTEND:{{event.till_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z%0ASUMMARY:AMA with {{event.ph_profile.name}}%0AEND:VEVENT%0AEND:VCALENDAR" download=event.ics target=_blank>iCal</a></li><li class=calendar-option-item><a ng-href="http://www.google.com/calendar/event?action=TEMPLATE&text=AMA with {{event.ph_profile.name}}&dates={{event.from_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z/{{event.till_date | utc | amDateFormat:\'YYYYMMDDTHHmmss\'}}Z&details={{event.ph_profile.headline}}&location=Makerhunt&trp=false&sprop=&sprop=name:" target=_blank>Google Calendar</a></li></ul></div></div></div></div></div><div class=ama><div class=row><div class="twelve columns"><!--<div class="ama--pic--wrapper">--><img class="u-max-full-width ama--pic" ng-src="{{event.ph_profile.image_url[\'88px@3X\']}}" alt="@{{event.username}}"><!--</div>\n                    <div class="ama--content--wrapper">--><h2 class=ama--maker-name>{{event.ph_profile.name}} <small class=ama--maker-username><a ng-href=https://twitter.com/{{event.username}} target=_blank>@{{event.username}}</a></small></h2><p class=ama--description>{{event.description}}</p><!--</div>--><div class=maker-of--wrapper><h6 class=ama--maker-headline ng-show=event.ph_profile.maker_of.length>Maker</h6><ul class=maker-of-list><li class=maker-of-list--item ng-repeat="product in event.ph_profile.maker_of | filter: productsFilter"><a target=_blank ng-href={{product.discussion_url}}>{{product.name}}</a></li></ul></div></div></div></div></div></div></div></div></div></section></div>'),a.put("app/modals/error.html","<div class=overlay ng-click=closeModal();><div modal response=response ng-click=$event.stopPropagation();></div></div>"),a.put("app/modals/me.html","<div class=overlay ng-click=closeModal();><div modal response=response ng-click=$event.stopPropagation();></div></div>"),a.put("app/signup/signup.html",'<div id=signupView><div class=container><div class=row><div class=signup--container><div class=envelope-container><img class=signupEnvelope src=http://www.clker.com/cliparts/5/1/7/6/11971542601675001438kuba_Envelope_2.svg.hi.png alt="Envelope"></div><div id=stepOne><div class=header-container><h2 class=signup--welcomeHeader>Hey there, @{{user.username}}!</h2><h5 class=signup--welcomeText>We checked your Twitter info to ensure you\'re human! Now, just a sec while we verify your Maker status on Product Hunt.</h5></div><div class=userCard><div class=row><div class="three columns"><div class=maker-img-wrapper><img class=userCard-userImg ng-src="{{user.image_url[\'32px\']}}"><div ng-if=isMaker() class="makerBadge animated bounceIn">M</div></div></div><div class="nine columns"><p class=userCard-userBio>{{user.headline}}</p></div></div></div><div class=actions><p class=processDescription>Don\'t be alarmed, it usually takes a second or two. Code stuff...</p><button ng-if=!ph_loaded class=checkingPHstatus disabled>Checking Product Hunt...</button> <button ng-if=ph_loaded class=nextStep ng-class="{makerBtn: isMaker(), nonMakerBtn: !isMaker()}" ng-click=goToStepTwo()>Continue <i class="fa fa-arrow-right"></i></button></div></div><div id=stepTwo class=hidden><form name=form ng-submit=submit(form) novalidate><div class=header-container><h2 class=signup--welcomeHeader ng-if=isMaker()>Almost there...</h2><h2 class=signup--welcomeHeader ng-if=!isMaker()>Oh no...</h2><h5 class=signup--welcomeText ng-if=isMaker()>We use Slack as a communication tool, please let us know which E-mail address we should send the invite to.</h5><h5 class=signup--welcomeText ng-if=!isMaker()>Currently only verified Makers on Product Hunt can join Maker Hunt. If you tell us your E-mail address we will let you know once there are other ways to join!</h5></div><input class=user-email type=email name=email ng-model=user.email placeholder=your@awesome.email required> <span class=error-txt ng-show="form.email.$error.required && !form.$pristine">Please enter a valid email address.</span> <span class=error-txt ng-show="form.email.$error.email && !form.$pristine">Please enter a valid email address.</span><p class=processDescription ng-if=isMaker()>Yay! You\'re confirmed as a maker on Product Hunt!</p><p class=processDescription ng-if=!isMaker()>Uh-oh! Looks like you\'re not marked as a Maker on Product hunt.</p><button ng-if=isMaker() class="finish-btn makerBtn" type=submit ng-disabled=form.$invalid>Send Invite <i class="fa fa-envelope-o"></i> <span class="spinner ng-hide" ng-show=form.$submitted><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span></button> <button ng-if=!isMaker() class="finish-btn nonMakerBtn" type=submit ng-disabled=form.$invalid>Subscribe <i class="fa fa-envelope-o"></i> <span class="spinner ng-hide" ng-show=form.$submitted><svg version=1.1 x=0 y=0 width=150px height=150px viewbox="-10 -10 120 120" enable-background="new 0 0 200 200" xml:space=preserve><path class=circle d="M0,50 A50,50,0 1 1 100,50 A50,50,0 1 1 0,50"></svg></span></button></form></div><div id=stepThree class=hidden><div class=header-container><h2 class=signup--welcomeHeader ng-if=teamMembers>Invite your Team</h2><h2 class=signup--welcomeHeader ng-if=!teamMembers>You\'re in!</h2><h5 class=signup--welcomeText ng-if=teamMembers>Looks like you worked with some awesome people before, why not invite them, too?</h5><h5 class=signup--welcomeText ng-if=!teamMembers>The invite has been sent! We can\'t wait for you to join us!</h5></div><div class=teamMembers-container ng-if=teamMembers><div class=teamMember ng-repeat="teamMember in teamMembers"><div class=image-container><img class=teamMember-pic ng-src="{{teamMember.image_url[\'32px\']}}"></div><div class=info-container><h4 class=teamMember-name>{{teamMember.name}}</h4><h6 class=teamMember-username>@{{teamMember.username}}</h6></div><a class=invite-teamMember ng-href=#><i class="fa fa-twitter"></i> Invite @{{teamMember.username}}</a></div></div><p class=processDescription ng-if=isMaker()>Click the button & check your email! :)</p><p class=processDescription ng-if=!isMaker()>My product is on ProductHunt, I\'m just not marked as the Maker yet!</p></div></div></div></div></div>')}]);