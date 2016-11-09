(function() {
  'use strict';

  angular
    .module('calories', [
      'ngRoute',
      'ngCookies',
      'ngPassword',
      'daterangepicker',
      'ngTable',
      'angular-md5',
      'ui.bootstrap',
      'ngAnimate',
      'ngSanitize',
      'mgcrea.ngStrap',
      'angular-momentjs'
    ])
    .config(config)
    .config(function($modalProvider) {
      angular.extend($modalProvider.defaults, {
        html: true
      });
    })
    .run(run)
    .constant('ROLE', {
      ADMIN: 0,
      USER_MANAGER: 1,
      REGULAR_USER: 2
    })
    .constant('DATE_FORMAT', 'YYYY-MM-DD')
    .constant('TIME_FORMAT', 'HH:mm:ss')
    .constant('API_URL', 'http://192.168.0.28/api/')
    .filter("rangeDate", function($moment, DATE_FORMAT, TIME_FORMAT) {
      return function(items, filterDate) {
        if (items === null || angular.isUndefined(items)) return null;

        var minDate, maxDate, minTime, maxTime;

        for (var i in items) {
          if (i == 0) {
            minDate = $moment(items[i].date, DATE_FORMAT);
            maxDate = $moment(items[i].date, DATE_FORMAT);
            minTime = $moment(items[i].time, TIME_FORMAT);
            maxTime = $moment(items[i].time, TIME_FORMAT);
          }
          if (minDate.isAfter($moment(items[i].date, DATE_FORMAT)))  minDate = $moment(items[i].date, DATE_FORMAT);
          if (maxDate.isBefore($moment(items[i].date, DATE_FORMAT))) maxDate = $moment(items[i].date, DATE_FORMAT);
          if (minTime.isAfter($moment(items[i].time, TIME_FORMAT)))  minTime = $moment(items[i].time, TIME_FORMAT);
          if (maxTime.isBefore($moment(items[i].time, TIME_FORMAT))) maxTime = $moment(items[i].time, TIME_FORMAT);
        }

        var df = filterDate.date.startDate,
            dt = filterDate.date.endDate,
            tf = filterDate.time.startTime,
            tt = filterDate.time.endTime;

        df = df === null ? minDate.subtract(1, 'days') : $moment(df, DATE_FORMAT);
        dt = dt === null ? maxDate.add(1, 'days') : $moment(dt, DATE_FORMAT);
        tf = tf === null ? minTime.subtract(1, 'minutes') : $moment($moment(tf).format(TIME_FORMAT), TIME_FORMAT);
        tt = tt === null ? maxTime.add(1, 'minutes') : $moment($moment(tt).format(TIME_FORMAT), TIME_FORMAT);

        var result = [];     
        for (var i in items){
          if (angular.isUndefined(items[i].date)) continue;
          var d = $moment(items[i].date, DATE_FORMAT);
          var t = $moment(items[i].time, TIME_FORMAT);
          if ((d.isAfter($moment(df)) && d.isBefore($moment(dt))) &&
              (t.isAfter($moment(tf)) && t.isBefore($moment(tt))))  {
            result.push(items[i]);
          }
        }
        return result;
      };
    });

  function parseDate(input) {
    var parts = input.split('-');
    return new Date(parts[2], parts[1]-1, parts[0]); 
  }

  config.$inject = ['$routeProvider', '$locationProvider', '$momentProvider'];

  function config($routeProvider, $locationProvider, $momentProvider) {
    $routeProvider
      .when('/admin-home', {
        controller: 'AdminHomeController',
        templateUrl: 'public/views/admin.home.view.html',
        controllerAs: 'vm'
      })
      .when('/user-manager-home', {
        controller: 'UserManagerHomeController',
        templateUrl: 'public/views/usermanager.home.view.html',
        controllerAs: 'vm'
      })
      .when('/regular-user-home', {
        controller: 'RegularUserHomeController',
        templateUrl: 'public/views/regularuser.home.view.html',
        controllerAs: 'vm'
      })
      .when('/login', {
        controller: 'LoginController',
        templateUrl: 'public/views/login.view.html',
        controllerAs: 'vm'
      })
      .when('/register', {
        controller: 'RegisterController',
        templateUrl: 'public/views/register.view.html',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/login'
      });

    $momentProvider
      .asyncLoading(false)
      .scriptUrl('node_modules/moment/min/moment.min.js');
  }

  run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];

  function run($rootScope, $location, $cookieStore, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page
      /*var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
      var loggedIn = $rootScope.globals.currentUser;
      if (restrictedPage && !loggedIn) {
          $location.path('/login');
      }*/
    });
  }

})();